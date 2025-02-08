import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    private readonly userService: UserService
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const user = await this.userService.findUser(dto.userId);
    const message = new this.messageModel({
      userId: dto.userId,
      username: user ? user.username : 'Anonymous',
      content: dto.content
    });
    return message.save();
  }
}
