import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { Room } from './schemas/room.schema';
import { RoomMessage } from './schemas/room-message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateRoomMessageDto } from './dto/create-room-message.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
    @InjectModel(Room.name) private readonly roomModel: Model<Room>,
    @InjectModel(RoomMessage.name)
    private readonly roomMessageModel: Model<RoomMessage>
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

  async createRoom(dto: CreateRoomDto): Promise<Room> {
    const room = new this.roomModel({
      name: dto.name,
      description: dto.description,
      creator: dto.creatorId,
      participants: [dto.creatorId]
    });
    return room.save();
  }

  async addUserToRoom(userId: string, roomId: string): Promise<Room> {
    return this.roomModel
      .findByIdAndUpdate(
        roomId,
        { $addToSet: { participants: userId } },
        { new: true }
      )
      .exec();
  }

  async removeUserFromRoom(userId: string, roomId: string): Promise<Room> {
    return this.roomModel
      .findByIdAndUpdate(
        roomId,
        { $pull: { participants: userId } },
        { new: true }
      )
      .exec();
  }

  async getUserRooms(userId: string): Promise<Room[]> {
    return this.roomModel
      .find({ participants: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRoomById(roomId: string): Promise<Room | null> {
    return this.roomModel.findById(roomId).exec();
  }

  async createRoomMessage(dto: CreateRoomMessageDto): Promise<RoomMessage> {
    const roomMessage = new this.roomMessageModel({
      room: dto.roomId,
      sender: dto.senderId,
      content: dto.content
    });
    return roomMessage.save();
  }

  async getRoomHistory(roomId: string): Promise<RoomMessage[]> {
    return this.roomMessageModel
      .find({ room: new mongoose.Types.ObjectId(roomId) })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async deleteRoom(roomId: string): Promise<void> {
    await Promise.all([
      this.roomModel.findByIdAndDelete(roomId).exec(),
      this.roomMessageModel.deleteMany({ room: roomId }).exec()
    ]);
  }

  async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
    const room = await this.roomModel
      .findOne({
        _id: roomId,
        participants: userId
      })
      .exec();
    return !!room;
  }
}
