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
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer() server: Server;
  private users = new Map<string, string>(); // Map<socketId, userId>

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
      this.logger.log(`User ${userId} connected`);
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
      this.logger.warn(`Unauthorized message attempt: ${client.id}`);
      return;
    }

    const sender = await this.userService.findUserById(senderId);
    const recipient = await this.userService.findUserById(data.recipientId);

    if (!recipient) {
      this.logger.warn(`Recipient ${data.recipientId} not found`);
      return;
    }

    const recipientSocketId = [...this.users.entries()].find(
      ([_, id]) => id === data.recipientId
    )?.[0];

    try {
      const message = await this.chatService.createMessage({
        sender,
        recipient,
        content: data.message
      } as CreateMessageDto);

      if (recipientSocketId) {
        this.server.to(recipientSocketId).emit('receiveMessage', message);
      }

      this.logger.debug(`Message sent from ${senderId} to ${data.recipientId}`);
    } catch (error) {
      this.logger.error(`Error sending message from ${senderId}`, error.stack);
    }
  }
}
