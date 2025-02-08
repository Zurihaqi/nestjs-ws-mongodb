import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { MessageSchema } from './schemas/message.schema';

import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' }
    }),
    MongooseModule.forFeature([
      { name: 'Message', schema: MessageSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  providers: [ChatGateway, ChatService, UserService]
})
export class ChatModule {}
