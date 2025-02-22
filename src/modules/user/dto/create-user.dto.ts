import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String, description: 'Email' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, description: 'Username' })
  @IsString()
  username: string;

  @ApiProperty({ type: String, description: 'Password' })
  @IsString()
  @MinLength(6)
  password: string;
}
