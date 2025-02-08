import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      senderId: dto.senderId,
      recipientId: dto.recipientId,
      content: dto.content
    });
    return message.save();
  }

  async getMessagesByRecipient(
    userId: string,
    otherUserId: string
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: userId }
        ]
      })
      .sort({ createdAt: 1 });
  }

  async getAllMessages(id: String): Promise<Message[]> {
    return this.messageModel.find({ senderId: id }).sort({ createdAt: 1 });
  }
}
