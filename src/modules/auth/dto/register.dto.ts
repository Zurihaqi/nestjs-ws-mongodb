import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @ApiProperty({ type: String, description: 'Email' })
  @IsEmail()
  email: string;

  @IsString()
  @ApiProperty({ type: String, description: 'Username' })
  username: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ type: String, description: 'Password' })
  password: string;
}
