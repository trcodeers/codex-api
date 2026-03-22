import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Test, TestDocument } from '../tests/schemas/test.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import { Attempt, AttemptDocument } from '../attempts/schemas/attempt.schema';
import { UpdateTestSessionDto } from './dto/update-test-session.dto';

@Injectable()
export class TestSessionsService {
  constructor(
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
  ) {}

  async startSession(userId: string, testId: string) {
    const test = await this.findActiveTestOrThrow(testId);
    const existingAttempt = await this.attemptModel
      .findOne({ userId: new Types.ObjectId(userId), testId: test._id })
      .sort({ createdAt: -1 })
      .exec();

    if (existingAttempt) {
      if (existingAttempt.status === 'active' && this.isFinished(existingAttempt)) {
        await this.finalizeAttempt(existingAttempt, test, 'expired');
        throw new BadRequestException('Test already attempted');
      }

      if (existingAttempt.status === 'active') {
        return this.buildSessionResponse(existingAttempt, test);
      }

      throw new BadRequestException('Test already attempted');
    }

    const now = new Date();
    const session = await this.attemptModel.create({
      userId: new Types.ObjectId(userId),
      testId: test._id,
      score: 0,
      total: test.totalMarks,
      correct: 0,
      wrong: 0,
      timeTaken: 0,
      startTime: now,
      duration: test.duration,
      status: 'active',
      answers: {},
      questionStatuses: this.buildQuestionStatusSeed(test),
      bookmarks: [],
      lastActivityAt: now,
    });

    return this.buildSessionResponse(session, test);
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.findSessionOrThrow(sessionId, userId);
    const test = await this.findTestOrThrow(String(session.testId));

    if (session.status === 'active' && this.isFinished(session)) {
      await this.finalizeAttempt(session, test, 'expired');
    }

    return this.buildSessionResponse(session, test);
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateTestSessionDto) {
    const session = await this.findSessionOrThrow(sessionId, userId);
    const test = await this.findTestOrThrow(String(session.testId));

    if (session.status !== 'active') {
      throw new BadRequestException('Test session already finished');
    }
    if (this.isFinished(session)) {
      await this.finalizeAttempt(session, test, 'expired');
      return this.buildSessionResponse(session, test);
    }

    const answers = this.serializeNumericMap(session.answers);
    const questionStatuses = this.serializeStringMap(session.questionStatuses);

    if (dto.answers) {
      for (const [questionId, selectedAnswer] of Object.entries(dto.answers)) {
        answers[questionId] = selectedAnswer;
        questionStatuses[questionId] = 'attempted';
      }
      session.set('answers', answers);
      session.set('questionStatuses', questionStatuses);
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

    if (session.status === 'submitted') {
      return this.buildSubmitResponse(session, test);
    }

    const finalStatus = this.isFinished(session) ? 'expired' : 'submitted';
    await this.finalizeAttempt(session, test, finalStatus);

    return this.buildSubmitResponse(session, test);
  }

  private async buildSessionResponse(session: AttemptDocument, test: TestDocument) {
    const questions = await this.fetchOrderedQuestions(test);
    return {
      sessionId: session.id,
      testId: String(test._id),
      title: test.title,
      duration: session.duration,
      startTime: session.startTime,
      status: session.status,
      score: session.score,
      total: session.total,
      correct: session.correct,
      wrong: session.wrong,
      timeTaken: session.timeTaken,
      answers: this.serializeNumericMap(session.answers),
      questionStatuses: this.serializeStringMap(session.questionStatuses),
      bookmarks: session.bookmarks,
      remainingTimeSeconds: this.getRemainingTimeSeconds(session),
      isFinished: this.isFinished(session),
      sections: test.sections.map((section, index) => ({
        index,
        name: section.name,
        questionIds: section.questionIds.map((questionId) => String(questionId)),
      })),
      questions,
    };
  }

  private buildSubmitResponse(session: AttemptDocument, test: TestDocument) {
    return {
      success: true,
      message: session.status === 'submitted' ? 'Test submitted successfully' : 'Test finished successfully',
      attempt: {
        id: session.id,
        testId: String(test._id),
        status: session.status,
        score: session.score,
        total: session.total,
        correct: session.correct,
        wrong: session.wrong,
        timeTaken: session.timeTaken,
      },
    };
  }

  private async finalizeAttempt(session: AttemptDocument, test: TestDocument, status: 'submitted' | 'expired') {
    const questionIds = test.sections.flatMap((section) => section.questionIds);
    const questions = await this.questionModel.find({ _id: { $in: questionIds } }).exec();
    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const answers = this.serializeNumericMap(session.answers);
    const questionStatuses = this.serializeStringMap(session.questionStatuses);

    let correct = 0;
    let wrong = 0;

    for (const questionId of questionIds.map((value) => String(value))) {
      const question = questionMap.get(questionId);
      const selectedAnswer = answers[questionId];

      if (!question || selectedAnswer === undefined) {
        questionStatuses[questionId] = questionStatuses[questionId] ?? 'unattempted';
        continue;
      }

      questionStatuses[questionId] = 'attempted';
      if (question.correctAnswer === selectedAnswer) {
        correct += 1;
      } else {
        wrong += 1;
      }
    }

    session.correct = correct;
    session.wrong = wrong;
    session.score = correct * test.marksPerQuestion - wrong * test.negativeMarks;
    session.total = test.totalMarks;
    session.timeTaken = Math.min(
      test.duration * 60,
      Math.max(0, Math.floor((Date.now() - session.startTime.getTime()) / 1000)),
    );
    session.status = status;
    session.submittedAt = new Date();
    session.lastActivityAt = new Date();
    session.set('questionStatuses', questionStatuses);
    await session.save();

    return session;
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
    const session = await this.attemptModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException('Test session not found');
    }
    if (String(session.userId) !== userId) {
      throw new ForbiddenException('You do not have access to this test session');
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

  private buildQuestionStatusSeed(test: TestDocument) {
    return Object.fromEntries(
      test.sections.flatMap((section) => section.questionIds.map((questionId) => [String(questionId), 'unattempted'])),
    );
  }

  private isFinished(session: AttemptDocument | { startTime: Date; duration: number }) {
    return (Date.now() - session.startTime.getTime()) / 1000 >= session.duration * 60;
  }

  private getRemainingTimeSeconds(session: AttemptDocument) {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - session.startTime.getTime()) / 1000));
    return Math.max(0, session.duration * 60 - elapsedSeconds);
  }

  private serializeNumericMap(answers: Map<string, number> | Record<string, number>) {
    if (answers instanceof Map) {
      return Object.fromEntries(answers.entries());
    }
    return answers;
  }

  private serializeStringMap(statuses: Map<string, string> | Record<string, string>) {
    if (statuses instanceof Map) {
      return Object.fromEntries(statuses.entries());
    }
    return statuses;
  }
}
