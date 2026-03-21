import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TestSession, TestSessionDocument } from './schemas/test-session.schema';
import { Test, TestDocument } from '../tests/schemas/test.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import { Attempt, AttemptDocument } from '../attempts/schemas/attempt.schema';
import { UpdateTestSessionDto } from './dto/update-test-session.dto';

@Injectable()
export class TestSessionsService {
  constructor(
    @InjectModel(TestSession.name) private readonly testSessionModel: Model<TestSessionDocument>,
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
  ) {}

  async startSession(userId: string, testId: string) {
    const test = await this.findActiveTestOrThrow(testId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + test.duration * 60 * 1000);

    const session = await this.testSessionModel.create({
      userId: new Types.ObjectId(userId),
      testId: test._id,
      startTime: now,
      expiresAt,
      duration: test.duration,
      status: 'active',
      answers: {},
      bookmarks: [],
      lastActivityAt: now,
    });

    return this.buildSessionResponse(session, test);
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.findSessionOrThrow(sessionId, userId);
    const test = await this.findTestOrThrow(String(session.testId));

    if (this.isExpired(session)) {
      return this.finishExpiredSession(session, test);
    }

    return this.buildSessionResponse(session, test);
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateTestSessionDto) {
    const session = await this.findSessionOrThrow(sessionId, userId);
    const test = await this.findTestOrThrow(String(session.testId));

    if (this.isExpired(session)) {
      return this.finishExpiredSession(session, test);
    }

    if (dto.answers) {
      session.set('answers', dto.answers);
    }
    if (dto.bookmarks) {
      session.bookmarks = [...new Set(dto.bookmarks)];
    }
    session.lastActivityAt = new Date();
    await session.save();

    return this.buildSessionResponse(session, test);
  }

  async submitSession(userId: string, sessionId: string) {
    const session = await this.findSessionOrThrow(sessionId, userId);
    const test = await this.findTestOrThrow(String(session.testId));
    const attempt = await this.createAttemptFromSession(session, test);

    await this.testSessionModel.findByIdAndDelete(session.id).exec();

    return {
      success: true,
      message: 'Test submitted successfully',
      attempt: {
        id: attempt.id,
        score: attempt.score,
        total: attempt.total,
        correct: attempt.correct,
        wrong: attempt.wrong,
        timeTaken: attempt.timeTaken,
      },
    };
  }

  private async buildSessionResponse(session: TestSessionDocument, test: TestDocument) {
    const questions = await this.fetchOrderedQuestions(test);
    return {
      sessionId: session.id,
      testId: String(test._id),
      title: test.title,
      duration: session.duration,
      startTime: session.startTime,
      expiresAt: session.expiresAt,
      status: session.status,
      answers: this.serializeAnswers(session.answers),
      bookmarks: session.bookmarks,
      remainingTimeSeconds: this.getRemainingTimeSeconds(session),
      sections: test.sections.map((section, index) => ({
        index,
        name: section.name,
        questionIds: section.questionIds.map((questionId) => String(questionId)),
      })),
      questions,
    };
  }

  private async finishExpiredSession(session: TestSessionDocument, test: TestDocument) {
    const attempt = await this.createAttemptFromSession(session, test);
    await this.testSessionModel.findByIdAndDelete(session.id).exec();

    return {
      sessionId: session.id,
      testId: String(test._id),
      status: 'expired',
      remainingTimeSeconds: 0,
      redirectToTests: true,
      attemptId: attempt.id,
    };
  }

  private async createAttemptFromSession(session: TestSessionDocument, test: TestDocument) {
    const questionIds = test.sections.flatMap((section) => section.questionIds);
    const questions = await this.questionModel.find({ _id: { $in: questionIds } }).exec();
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const answers = this.serializeAnswers(session.answers);

    let correct = 0;
    let wrong = 0;

    for (const [questionId, selectedAnswer] of Object.entries(answers)) {
      const question = questionMap.get(questionId);
      if (!question) {
        continue;
      }
      if (question.correctAnswer === selectedAnswer) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    const score = correct * test.marksPerQuestion - wrong * test.negativeMarks;
    const timeTaken = Math.min(
      test.duration * 60,
      Math.max(0, Math.floor((Date.now() - session.startTime.getTime()) / 1000)),
    );

    return this.attemptModel.create({
      userId: session.userId,
      testId: test._id,
      score,
      total: test.totalMarks,
      correct,
      wrong,
      timeTaken,
      answers,
    });
  }

  private async fetchOrderedQuestions(test: TestDocument) {
    const questionIds = test.sections.flatMap((section) => section.questionIds);
    const questions = await this.questionModel.find({ _id: { $in: questionIds } }).exec();
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    return questionIds.flatMap((questionId) => {
      const question = questionMap.get(String(questionId));
      if (!question) {
        return [];
      }
      return [
        {
          id: question.id,
          subject: question.subject,
          examTags: question.examTags,
          difficulty: question.difficulty,
          text: question.text,
          images: question.images,
          options: question.options,
        },
      ];
    });
  }

  private async findSessionOrThrow(sessionId: string, userId: string) {
    const session = await this.testSessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Test session not found');
    }
    if (String(session.userId) !== userId) {
      throw new ForbiddenException('You do not have access to this test session');
    }
    if (session.status === 'submitted') {
      throw new BadRequestException('Test session already submitted');
    }
    return session;
  }

  private async findActiveTestOrThrow(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    if (!test.isActive) {
      throw new BadRequestException('Test is not active');
    }
    return test;
  }

  private async findTestOrThrow(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  private isExpired(session: TestSessionDocument) {
    return session.expiresAt.getTime() <= Date.now();
  }

  private getRemainingTimeSeconds(session: TestSessionDocument) {
    return Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000));
  }

  private serializeAnswers(answers: Map<string, number> | Record<string, number>) {
    if (answers instanceof Map) {
      return Object.fromEntries(answers.entries());
    }
    return answers;
  }
}
