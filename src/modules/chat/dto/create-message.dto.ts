import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsString()
  senderId: string;

  @ApiProperty({ type: String, description: 'Recipient ID' })
  @IsString()
  recipientId: string;

  @ApiProperty({ type: String, description: 'Message content' })
  @IsString()
  content: string;
}
