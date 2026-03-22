import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionRequest } from './types/session-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto, @Req() req: SessionRequest) {
    return this.authService.register(registerDto, req);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() req: SessionRequest) {
    return this.authService.login(loginDto, req);
  }

  @Get('me')
  async me(@Req() req: SessionRequest) {
    if (!req.session.userId) {
      throw new UnauthorizedException('Not authenticated');
    }

    return this.authService.getSessionUser(req.session.userId);
  }
}
