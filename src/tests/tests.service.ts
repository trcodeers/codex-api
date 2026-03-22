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

    const tests = await this.testModel.find({ examId: exam._id, isActive: true }).exec();
    return tests.map((test) => {
      const questionsCount = test.sections.reduce((count, section) => count + section.questionIds.length, 0);
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
      };
    });
  }

  async findById(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }
}
