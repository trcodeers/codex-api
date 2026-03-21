import { Controller, Get, Param } from '@nestjs/common';
import { QuestionsService } from '../questions/questions.service';

@Controller('tests')
export class TestsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get(':testId/questions')
  getQuestions(@Param('testId') testId: string) {
    return this.questionsService.findByTestId(testId);
  }
}
