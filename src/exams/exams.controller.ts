import { Controller, Get, Param } from '@nestjs/common';
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
  getTestsByExam(@Param('examId') examId: string) {
    return this.testsService.findByExamId(examId);
  }
}
