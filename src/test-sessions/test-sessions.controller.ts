import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { UpdateTestSessionDto } from './dto/update-test-session.dto';
import { TestSessionsService } from './test-sessions.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TestSessionsController {
  constructor(private readonly testSessionsService: TestSessionsService) {}

  @Post('tests/:testId/start-session')
  startSession(@CurrentUser() user: JwtPayload, @Param('testId') testId: string) {
    return this.testSessionsService.startSession(user.sub, testId);
  }

  @Get('test-sessions/:sessionId')
  getSession(@CurrentUser() user: JwtPayload, @Param('sessionId') sessionId: string) {
    return this.testSessionsService.getSession(user.sub, sessionId);
  }

  @Patch('test-sessions/:sessionId')
  updateSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateTestSessionDto,
  ) {
    return this.testSessionsService.updateSession(user.sub, sessionId, dto);
  }

  @Post('test-sessions/:sessionId/submit')
  submitSession(@CurrentUser() user: JwtPayload, @Param('sessionId') sessionId: string) {
    return this.testSessionsService.submitSession(user.sub, sessionId);
  }
}
