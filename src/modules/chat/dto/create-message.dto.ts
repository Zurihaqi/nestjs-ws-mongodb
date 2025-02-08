import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ type: String, description: 'Message content' })
  @IsString()
  content: string;
}
