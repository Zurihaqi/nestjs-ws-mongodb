import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, description: 'Email' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, description: 'Password' })
  @IsString()
  password: string;
}
