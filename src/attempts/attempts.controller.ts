import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { AttemptsService } from './attempts.service';

@UseGuards(JwtAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  submitAttempt(@CurrentUser() user: JwtPayload, @Body() createAttemptDto: CreateAttemptDto) {
    return this.attemptsService.create(user.sub, createAttemptDto);
  }

  @Get()
  getAttemptHistory(@CurrentUser() user: JwtPayload) {
    return this.attemptsService.findByUser(user.sub);
  }
}
