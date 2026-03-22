import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { SessionRequest } from '../auth/types/session-request.type';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { GetAttemptHistoryQueryDto } from './dto/get-attempt-history-query.dto';
import { AttemptsService } from './attempts.service';

@UseGuards(SessionAuthGuard)
@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @Post()
  submitAttempt(@Req() req: SessionRequest, @Body() createAttemptDto: CreateAttemptDto) {
    return this.attemptsService.create(req.session.userId!, createAttemptDto);
  }

  @Get()
  getAttemptHistory(@Req() req: SessionRequest, @Query() query: GetAttemptHistoryQueryDto) {
    return this.attemptsService.findByUser(req.session.userId!, query);
  }

  @Get(':attemptId')
  getAttemptDetails(@Req() req: SessionRequest, @Param('attemptId') attemptId: string) {
    return this.attemptsService.findAttemptDetails(req.session.userId!, attemptId);
  }
}
