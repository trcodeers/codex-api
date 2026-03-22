import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Test, TestDocument } from './schemas/test.schema';
import { Exam, ExamDocument } from '../exams/schemas/exam.schema';
import { Attempt, AttemptDocument } from '../attempts/schemas/attempt.schema';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
  ) {}

  async findByExamId(examIdentifier: string, userId?: string) {
    const exam = isValidObjectId(examIdentifier)
      ? await this.examModel.findOne({ $or: [{ _id: examIdentifier }, { slug: examIdentifier }] }).exec()
      : await this.examModel.findOne({ slug: examIdentifier }).exec();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const tests = await this.testModel.find({ examId: exam._id, isActive: true }).exec();
    const latestAttemptByTestId = await this.findLatestAttemptsByTestId(tests, userId);

    const mappedTests = tests.map((test) => {
      const questionsCount = test.sections.reduce((count, section) => count + section.questionIds.length, 0);
      const latestAttempt = latestAttemptByTestId.get(test.id);
      const isAttempted = latestAttempt ? this.isAttemptCompleted(latestAttempt) : false;

      return {
        id: test.id,
        examId: exam.slug,
        title: test.title,
        sections: test.sections,
        questionsCount,
        marksPerQuestion: test.marksPerQuestion,
        negativeMarks: test.negativeMarks,
        duration: test.duration,
        totalMarks: test.totalMarks,
        isActive: test.isActive,
        expiresAt: test.expiresAt,
        sessionId: latestAttempt ? String(latestAttempt._id) : null,
        sessionStatus: latestAttempt ? this.getAttemptStatus(latestAttempt) : 'not_started',
        isAttempted,
        latestScore: isAttempted ? latestAttempt?.score ?? 0 : null,
        attemptedAt: isAttempted ? latestAttempt?.submittedAt?.toISOString().slice(0, 10) ?? latestAttempt?.createdAt.toISOString().slice(0, 10) ?? null : null,
      };
    });

    return {
      examId: exam.slug,
      availableTests: mappedTests.filter((test) => !test.isAttempted),
      attemptedTests: mappedTests.filter((test) => test.isAttempted),
    };
  }

  async findById(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  private async findLatestAttemptsByTestId(tests: TestDocument[], userId?: string) {
    if (!userId || tests.length === 0) {
      return new Map();
    }

    const attempts = await this.attemptModel
      .find({
        userId: new Types.ObjectId(userId),
        testId: { $in: tests.map((test) => test._id) },
      })
      .sort({ createdAt: -1 })
      .select('_id testId score createdAt submittedAt status startTime duration')
      .lean()
      .exec();

    const latestAttemptByTestId = new Map<string, (typeof attempts)[number]>();

    for (const attempt of attempts) {
      const testId = String(attempt.testId);
      if (!latestAttemptByTestId.has(testId)) {
        latestAttemptByTestId.set(testId, attempt);
      }
    }

    return latestAttemptByTestId;
  }

  private isAttemptCompleted(attempt: {
    status: 'active' | 'submitted' | 'expired';
    startTime: Date;
    duration: number;
  }) {
    return attempt.status === 'submitted' || attempt.status === 'expired' || this.hasExceededDuration(attempt);
  }

  private getAttemptStatus(attempt: {
    status: 'active' | 'submitted' | 'expired';
    startTime: Date;
    duration: number;
  }) {
    return this.hasExceededDuration(attempt) && attempt.status === 'active' ? 'expired' : attempt.status;
  }

  private hasExceededDuration(attempt: { startTime: Date; duration: number }) {
    return (Date.now() - attempt.startTime.getTime()) / 1000 >= attempt.duration * 60;
  }
}
