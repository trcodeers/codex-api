import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import dayjs from 'dayjs';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { TestsService } from '../tests/tests.service';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
    private readonly testsService: TestsService,
  ) {}

  async create(userId: string, dto: CreateAttemptDto) {
    const test = await this.testsService.findById(dto.testId);

    const attempt = await this.attemptModel.create({
      userId: new Types.ObjectId(userId),
      testId: test._id,
      score: dto.score,
      total: dto.total,
      timeTaken: dto.timeTaken,
      answers: dto.answers,
    });

    return {
      id: attempt.id,
      testId: dto.testId,
      testTitle: test.title,
      score: attempt.score,
      total: attempt.total,
      date: dayjs(attempt.createdAt).format('DD MMM YYYY'),
      timeTaken: attempt.timeTaken,
      answers: attempt.answers,
    };
  }

  async findByUser(userId: string) {
    const attempts = await this.attemptModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .populate({ path: 'testId', select: 'title' })
      .exec();

    return attempts.map((attempt) => ({
      id: attempt.id,
      testId: String(attempt.testId?._id ?? attempt.testId),
      testTitle: (attempt.testId as { title?: string })?.title ?? 'Unknown Test',
      score: attempt.score,
      total: attempt.total,
      date: dayjs(attempt.createdAt).format('DD MMM YYYY'),
      timeTaken: attempt.timeTaken,
      answers: Object.fromEntries((attempt.answers as Map<string, number>).entries()),
    }));
  }
}
