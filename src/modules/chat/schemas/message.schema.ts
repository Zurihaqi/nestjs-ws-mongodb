import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDto } from 'src/modules/user/dto/user.dto';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  sender: UserDto;

  @Prop({ required: true })
  recipient: UserDto;

  @Prop({ required: true })
  content: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
