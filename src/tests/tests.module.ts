import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestSchema } from './schemas/test.schema';
import { TestsService } from './tests.service';
import { TestsController } from './tests.controller';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { QuestionsModule } from '../questions/questions.module';
import { Attempt, AttemptSchema } from '../attempts/schemas/attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Test.name, schema: TestSchema },
      { name: Exam.name, schema: ExamSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
    forwardRef(() => QuestionsModule),
  ],
  controllers: [TestsController],
  providers: [TestsService],
  exports: [TestsService, MongooseModule],
})
export class TestsModule {}
