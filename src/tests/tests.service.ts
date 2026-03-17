import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Test, TestDocument } from './schemas/test.schema';
import { Exam, ExamDocument } from '../exams/schemas/exam.schema';

@Injectable()
export class TestsService {
  constructor(
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
  ) {}

  async findByExamId(examIdentifier: string) {
    const exam = isValidObjectId(examIdentifier)
      ? await this.examModel.findOne({ $or: [{ _id: examIdentifier }, { slug: examIdentifier }] }).exec()
      : await this.examModel.findOne({ slug: examIdentifier }).exec();

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const tests = await this.testModel.find({ examId: exam._id }).exec();
    return tests.map((test) => ({
      id: test.id,
      examId: exam.slug,
      title: test.title,
      questionsCount: test.questionsCount,
      duration: test.duration,
      totalMarks: test.totalMarks,
      difficulty: test.difficulty,
    }));
  }

  async findById(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }
}
