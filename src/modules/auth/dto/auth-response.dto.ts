import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthResponseDto {
  @ApiProperty({ type: String, description: 'Access token' })
  @IsString()
  accessToken: string;
}
