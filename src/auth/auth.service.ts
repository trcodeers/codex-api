import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionRequest } from './types/session-request.type';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, req: SessionRequest) {
    const user = await this.usersService.create(dto);
    await this.attachSessionUser(req, user.id);
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto, req: SessionRequest) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.attachSessionUser(req, user.id);
    return this.buildAuthResponse(user);
  }

  async getSessionUser(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return {
      success: true,
      user: this.serializeUser(user),
    };
  }

  private async attachSessionUser(req: SessionRequest, userId: string) {
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((regenerateError) => {
        if (regenerateError) {
          reject(regenerateError);
          return;
        }

        req.session.userId = userId;
        req.session.save((saveError) => {
          if (saveError) {
            reject(saveError);
            return;
          }

          resolve();
        });
      });
    }).catch((error: Error) => {
      throw new InternalServerErrorException(`Unable to create user session: ${error.message}`);
    });
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
