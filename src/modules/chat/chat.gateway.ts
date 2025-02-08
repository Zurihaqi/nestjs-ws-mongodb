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
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;
  private users = new Map<string, string>(); // Store userId -> socketId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) throw new Error('No token provided');

      const payload = this.jwtService.verify(token);
      this.users.set(client.id, payload.userId);
      this.logger.log(`User ${payload.userId} connected`);
    } catch (error) {
      client.disconnect();
      this.logger.error('Unauthorized connection attempt', error.stack);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.users.get(client.id);
    this.users.delete(client.id);
    this.logger.log(`User ${userId || 'unknown'} disconnected`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: string; message: string }
  ) {
    const senderId = this.users.get(client.id);
    if (!senderId) {
      this.logger.warn(`Message attempt from unauthorized user: ${client.id}`);
      return;
    }

    const recipientSocketId = [...this.users.entries()].find(
      ([socketId, userId]) => userId === data.recipientId
    )?.[0];

    if (!recipientSocketId) {
      this.logger.warn(`Recipient user with ID ${data.recipientId} not found`);
      return;
    }

    try {
      const message = await this.chatService.createMessage({
        senderId: senderId,
        recipientId: data.recipientId,
        content: data.message
      });
      this.server.to(recipientSocketId).emit('receiveMessage', message);
      this.logger.debug(
        `Message sent from user ${senderId} to ${data.recipientId}: ${data.message}`
      );
    } catch (error) {
      this.logger.error(
        `Error sending message from user ${senderId}`,
        error.stack
      );
    }
  }
}
