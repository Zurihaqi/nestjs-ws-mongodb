import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('chat')
@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Get message history by recipient' })
  @ApiResponse({
    status: 200,
    type: [CreateMessageDto],
    description: 'Success get message history'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @Get(':recipientId')
  async getMessagesByRecipientId(
    @Param('recipientId') recipientId: string,
    @Req() request: any
  ) {
    const loggedInUserId = request.user.userId;

    return await this.chatService.getMessagesByRecipient(
      loggedInUserId,
      recipientId
    );
  }

  @ApiOperation({ summary: 'Get all message history' })
  @ApiResponse({
    status: 200,
    type: [CreateMessageDto],
    description: 'Success get message history'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  @Get()
  async getMessages(@Req() request: any) {
    const loggedInUserId = request.user.userId;

    return await this.chatService.getAllMessages(loggedInUserId);
  }
}
