import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schemas/user.schema';

import { Room, RoomSchema } from './schemas/room.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { RoomMessage, RoomMessageSchema } from './schemas/room-message.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' }
    }),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
      { name: Room.name, schema: RoomSchema },
      { name: RoomMessage.name, schema: RoomMessageSchema }
    ])
  ],
  providers: [ChatGateway, ChatService, UserService],
  controllers: [ChatController]
})
export class ChatModule {}
