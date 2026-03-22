import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attempt, AttemptDocument } from './schemas/attempt.schema';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { GetAttemptHistoryQueryDto } from './dto/get-attempt-history-query.dto';
import { TestsService } from '../tests/tests.service';
import { Test, TestDocument } from '../tests/schemas/test.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name) private readonly attemptModel: Model<AttemptDocument>,
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    private readonly testsService: TestsService,
  ) {}

  async create(userId: string, dto: CreateAttemptDto) {
    const test = await this.testsService.findById(dto.testId);

    const attempt = await this.attemptModel.create({
      userId: new Types.ObjectId(userId),
      testId: test._id,
      score: dto.score,
      total: dto.total,
      correct: dto.correct,
      wrong: dto.wrong,
      timeTaken: dto.timeTaken,
      answers: dto.answers,
    });

    const totalQuestions = this.countQuestions(test.sections);

    return {
      attemptId: attempt.id,
      testId: dto.testId,
      testTitle: test.title,
      score: attempt.score,
      total: attempt.total,
      correct: attempt.correct,
      wrong: attempt.wrong,
      accuracy: this.calculateAccuracy(attempt.correct, totalQuestions),
      createdAt: attempt.createdAt.toISOString().slice(0, 10),
      timeTaken: attempt.timeTaken,
    };
  }

  async findByUser(userId: string, query: GetAttemptHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [attempts, total] = await Promise.all([
      this.attemptModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.attemptModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec(),
    ]);

    const testIds = [...new Set(attempts.map((attempt) => String(attempt.testId)))];
    const tests = await this.testModel.find({ _id: { $in: testIds } }).select('title sections').lean().exec();
    const testMap = new Map(tests.map((test) => [String(test._id), test]));

    return {
      data: attempts.map((attempt) => {
        const test = testMap.get(String(attempt.testId));
        const totalQuestions = this.countQuestions(test?.sections ?? []);

        return {
          attemptId: String(attempt._id),
          testId: String(attempt.testId),
          testTitle: test?.title ?? 'Unknown Test',
          score: attempt.score,
          total: attempt.total,
          correct: attempt.correct,
          wrong: attempt.wrong,
          accuracy: this.calculateAccuracy(attempt.correct, totalQuestions),
          createdAt: attempt.createdAt.toISOString().slice(0, 10),
        };
      }),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findAttemptDetails(userId: string, attemptId: string) {
    const attempt = await this.attemptModel.findById(attemptId).lean().exec();
    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }
    if (String(attempt.userId) !== userId) {
      throw new ForbiddenException('You do not have access to this attempt');
    }

    const test = await this.testModel.findById(attempt.testId).lean().exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const orderedQuestionIds = test.sections.flatMap((section) => section.questionIds.map((questionId) => String(questionId)));
    const questions = await this.questionModel
      .find({ _id: { $in: orderedQuestionIds } })
      .select('text images options correctAnswer explanation')
      .lean()
      .exec();
    const questionMap = new Map(questions.map((question) => [String(question._id), question]));
    const answers = this.serializeAnswers(attempt.answers);
    const totalQuestions = orderedQuestionIds.length;

    return {
      attemptId: String(attempt._id),
      testId: String(test._id),
      testTitle: test.title,
      score: attempt.score,
      total: attempt.total,
      correct: attempt.correct,
      wrong: attempt.wrong,
      accuracy: this.calculateAccuracy(attempt.correct, totalQuestions),
      timeTaken: attempt.timeTaken,
      sections: test.sections.map((section) => {
        let correct = 0;
        let wrong = 0;

        for (const questionId of section.questionIds.map((value) => String(value))) {
          const question = questionMap.get(questionId);
          const selectedAnswer = answers[questionId];

          if (selectedAnswer === undefined || !question) {
            continue;
          }

          if (selectedAnswer === question.correctAnswer) {
            correct += 1;
          } else {
            wrong += 1;
          }
        }

        return {
          name: section.name,
          correct,
          wrong,
        };
      }),
      questions: orderedQuestionIds.flatMap((questionId) => {
        const question = questionMap.get(questionId);
        if (!question) {
          return [];
        }

        const selectedAnswer = answers[questionId];

        return [
          {
            questionId,
            text: question.text,
            images: question.images,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: selectedAnswer ?? null,
            isCorrect: selectedAnswer === question.correctAnswer,
            explanation: question.explanation,
          },
        ];
      }),
    };
  }

  private countQuestions(sections: Array<{ questionIds: Array<Types.ObjectId | string> }>) {
    return sections.reduce((count, section) => count + section.questionIds.length, 0);
  }

  private calculateAccuracy(correct: number, totalQuestions: number) {
    if (totalQuestions === 0) {
      return 0;
    }

    return Number(((correct / totalQuestions) * 100).toFixed(2));
  }

  private serializeAnswers(answers: Map<string, number> | Record<string, number>) {
    if (answers instanceof Map) {
      return Object.fromEntries(answers.entries());
    }
    return answers;
  }
}
