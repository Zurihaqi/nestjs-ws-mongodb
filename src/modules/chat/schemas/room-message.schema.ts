import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RoomMessage extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true })
  room: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  sender: string;

  @Prop({ required: true })
  content: string;
}

export const RoomMessageSchema = SchemaFactory.createForClass(RoomMessage);
