import { Controller, Get, Param, Req } from '@nestjs/common';
import { SessionRequest } from '../auth/types/session-request.type';
import { QuestionsService } from '../questions/questions.service';
import { TestsService } from './tests.service';

@Controller('tests')
export class TestsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly testsService: TestsService,
  ) {}

  @Get(':testId/questions')
  getQuestions(@Param('testId') testId: string) {
    return this.questionsService.findByTestId(testId);
  }

  @Get('exam/:examId')
  getTestsByExam(@Param('examId') examId: string, @Req() req: SessionRequest) {
    return this.testsService.findByExamId(examId, req.session.userId);
  }
}
