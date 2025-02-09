import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    const user = await this.userService.createUser(dto);
    return { accessToken: this.jwtService.sign({ userId: user._id }) };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findUser(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { accessToken: this.jwtService.sign({ userId: user._id }) };
  }
}
