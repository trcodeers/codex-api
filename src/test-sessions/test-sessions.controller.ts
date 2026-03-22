import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { SessionRequest } from '../auth/types/session-request.type';
import { UpdateTestSessionDto } from './dto/update-test-session.dto';
import { TestSessionsService } from './test-sessions.service';

@UseGuards(SessionAuthGuard)
@Controller()
export class TestSessionsController {
  constructor(private readonly testSessionsService: TestSessionsService) {}

  @Post('tests/:testId/start-session')
  startSession(@Req() req: SessionRequest, @Param('testId') testId: string) {
    return this.testSessionsService.startSession(req.session.userId!, testId);
  }

  @Get('test-sessions/:sessionId')
  getSession(@Req() req: SessionRequest, @Param('sessionId') sessionId: string) {
    return this.testSessionsService.getSession(req.session.userId!, sessionId);
  }

  @Patch('test-sessions/:sessionId')
  updateSession(@Req() req: SessionRequest, @Param('sessionId') sessionId: string, @Body() dto: UpdateTestSessionDto) {
    return this.testSessionsService.updateSession(req.session.userId!, sessionId, dto);
  }

  @Post('test-sessions/:sessionId/submit')
  submitSession(@Req() req: SessionRequest, @Param('sessionId') sessionId: string) {
    return this.testSessionsService.submitSession(req.session.userId!, sessionId);
  }
}
