import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { Test, TestSchema } from '../tests/schemas/test.schema';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Question.name, schema: QuestionSchema },
      { name: Test.name, schema: TestSchema },
      { name: Exam.name, schema: ExamSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard, AdminGuard],
})
export class AdminModule {}
