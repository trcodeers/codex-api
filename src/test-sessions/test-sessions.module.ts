import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestSessionsController } from './test-sessions.controller';
import { TestSessionsService } from './test-sessions.service';
import { TestSession, TestSessionSchema } from './schemas/test-session.schema';
import { Test, TestSchema } from '../tests/schemas/test.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { Attempt, AttemptSchema } from '../attempts/schemas/attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestSession.name, schema: TestSessionSchema },
      { name: Test.name, schema: TestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: Attempt.name, schema: AttemptSchema },
    ]),
  ],
  controllers: [TestSessionsController],
  providers: [TestSessionsService],
  exports: [TestSessionsService],
})
export class TestSessionsModule {}
