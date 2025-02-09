import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserDto {
  @ApiProperty({ type: String, description: 'ID' })
  @IsString()
  id: string;

  @ApiProperty({ type: String, description: 'Email' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, description: 'Username' })
  @IsString()
  username: string;
}
