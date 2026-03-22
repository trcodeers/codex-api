import { Controller, Get, Param, Req } from '@nestjs/common';
import { SessionRequest } from '../auth/types/session-request.type';
import { ExamsService } from './exams.service';
import { TestsService } from '../tests/tests.service';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly testsService: TestsService,
  ) {}

  @Get()
  getExams() {
    return this.examsService.findAll();
  }

  @Get(':examId/tests')
  getTestsByExam(@Param('examId') examId: string, @Req() req: SessionRequest) {
    return this.testsService.findByExamId(examId, req.session.userId);
  }
}
