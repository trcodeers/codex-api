import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, req: Request) {
    const user = await this.usersService.create(dto);
    this.attachSessionUser(req, user.id);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto, req: Request) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.attachSessionUser(req, user.id);
    return this.buildAuthResponse(user);
  }

  async getSessionUser(userId: string) {
    const user = await this.usersService.findById(userId);
    return {
      success: true,
      user: this.serializeUser(user),
    };
  }

  private attachSessionUser(req: Request, userId: string) {
    req.session.userId = userId;
  }

  private buildAuthResponse(user: UserDocument) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      token,
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: UserDocument) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      goal: user.goal,
      role: user.role,
    };
  }
}
