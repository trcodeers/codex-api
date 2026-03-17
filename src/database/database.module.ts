import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeederService } from './database.seeder.service';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { Test, TestSchema } from '../tests/schemas/test.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Test.name, schema: TestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DatabaseSeederService],
  exports: [DatabaseSeederService],
})
export class DatabaseModule {}
