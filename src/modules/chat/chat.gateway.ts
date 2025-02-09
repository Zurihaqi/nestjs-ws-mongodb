import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

interface RoomData {
  name: string;
  description?: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  participants: Set<string>; // Set of user IDs
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;
  private users = new Map<string, string>(); // Map<socketId, userId>
  private rooms = new Map<string, ChatRoom>(); // Map<roomId, ChatRoom>
  private userRooms = new Map<string, Set<string>>(); // Map<userId, Set<roomId>>

  constructor(
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token);
      const userId = payload.userId;

      this.users.set(client.id, userId);
      this.userRooms.set(userId, new Set());

      const userRooms = await this.chatService.getUserRooms(userId);
      for (const room of userRooms) {
        await this.handleJoinRoom(client, { roomId: room.id });
      }

      this.logger.log(`User ${userId} connected`);
    } catch (error) {
      client.disconnect();
      this.logger.error('Unauthorized connection attempt', error.stack);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.users.get(client.id);
    if (userId) {
      this.users.delete(client.id);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomData: RoomData
  ) {
    const userId = this.users.get(client.id);
    if (!userId) return;

    try {
      const room = await this.chatService.createRoom({
        name: roomData.name,
        description: roomData.description,
        creatorId: userId
      });

      const chatRoom: ChatRoom = {
        id: room.id,
        name: room.name,
        description: room.description,
        participants: new Set([userId])
      };

      this.rooms.set(room.id, chatRoom);
      this.userRooms.get(userId)?.add(room.id);

      client.join(room.id);

      client.emit('roomCreated', room);

      this.logger.log(`Room ${room.id} created by user ${userId}`);
    } catch (error) {
      this.logger.error(`Error creating room by user ${userId}`, error.stack);
      client.emit('error', 'Failed to create room');
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId = this.users.get(client.id);
    if (!userId) return;

    const room = this.rooms.get(data.roomId);
    if (!room) {
      client.emit('error', 'Room not found');
      return;
    }

    try {
      await this.chatService.addUserToRoom(userId, data.roomId);

      room.participants.add(userId);
      this.userRooms.get(userId)?.add(data.roomId);

      client.join(data.roomId);

      this.server.to(data.roomId).emit('userJoined', {
        roomId: data.roomId,
        userId: userId
      });

      const history = await this.chatService.getRoomHistory(data.roomId);
      client.emit('roomHistory', history);

      this.logger.log(`User ${userId} joined room ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room ${data.roomId}`, error.stack);
      client.emit('error', 'Failed to join room');
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string }
  ) {
    const userId = this.users.get(client.id);
    if (!userId) return;

    const room = this.rooms.get(data.roomId);
    if (!room) return;

    try {
      await this.chatService.removeUserFromRoom(userId, data.roomId);

      room.participants.delete(userId);
      this.userRooms.get(userId)?.delete(data.roomId);

      client.leave(data.roomId);

      this.server.to(data.roomId).emit('userLeft', {
        roomId: data.roomId,
        userId: userId
      });

      this.logger.log(`User ${userId} left room ${data.roomId}`);
    } catch (error) {
      this.logger.error(`Error leaving room ${data.roomId}`, error.stack);
      client.emit('error', 'Failed to leave room');
    }
  }

  @SubscribeMessage('roomMessage')
  async handleRoomMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; message: string }
  ) {
    const userId = this.users.get(client.id);
    if (!userId) return;

    const room = this.rooms.get(data.roomId);
    if (!room || !room.participants.has(userId)) {
      client.emit('error', 'Not a member of this room');
      return;
    }

    try {
      const message = await this.chatService.createRoomMessage({
        roomId: data.roomId,
        senderId: userId,
        content: data.message
      });

      this.server.to(data.roomId).emit('newRoomMessage', {
        roomId: data.roomId,
        message
      });

      this.logger.debug(
        `Message sent to room ${data.roomId} by user ${userId}`
      );
    } catch (error) {
      this.logger.error(
        `Error sending message to room ${data.roomId}`,
        error.stack
      );
      client.emit('error', 'Failed to send message');
    }
  }

  @SubscribeMessage('getRooms')
  async handleGetRooms(@ConnectedSocket() client: Socket) {
    const userId = this.users.get(client.id);
    if (!userId) return;

    try {
      const rooms = await this.chatService.getUserRooms(userId);
      client.emit('rooms', rooms);
    } catch (error) {
      this.logger.error(`Error fetching rooms for user ${userId}`, error.stack);
      client.emit('error', 'Failed to fetch rooms');
    }
  }
}
