import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const message = new this.messageModel({
      sender: dto.sender,
      recipient: dto.recipient,
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
          {
            'sender._id': new mongoose.Types.ObjectId(userId),
            'recipient._id': new mongoose.Types.ObjectId(otherUserId)
          },
          {
            'sender._id': new mongoose.Types.ObjectId(otherUserId),
            'recipient._id': new mongoose.Types.ObjectId(userId)
          }
        ]
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getAllMessages(id: string): Promise<Message[]> {
    return this.messageModel
      .find({ 'sender._id': new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: 1 })
      .exec();
  }
}
