import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { UserDto } from 'src/modules/user/dto/user.dto';

export class CreateMessageDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsString()
  sender: UserDto;

  @ApiProperty({ type: String, description: 'Recipient ID' })
  @IsString()
  recipient: UserDto;

  @ApiProperty({ type: String, description: 'Message content' })
  @IsString()
  content: string;
}
