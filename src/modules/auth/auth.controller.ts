import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({ type: RegisterDto })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'User successfully registered'
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiBody({ type: LoginDto })
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 200,
    type: AuthResponseDto,
    description: 'User successfully logged in'
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }
}
