import { Controller, Get, UseGuards } from '@nestjs/common';
import dayjs from 'dayjs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      joinedDate: dayjs(user.createdAt).format('MMM DD, YYYY'),
      goal: user.goal,
    };
  }
}
