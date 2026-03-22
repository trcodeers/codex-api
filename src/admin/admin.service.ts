import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionsDto } from './dto/filter-questions.dto';
import { CreateAdminTestDto } from './dto/create-admin-test.dto';
import { AddSectionQuestionsDto } from './dto/add-section-questions.dto';
import { Test, TestDocument } from '../tests/schemas/test.schema';
import { Exam, ExamDocument } from '../exams/schemas/exam.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
  ) {}

  async createQuestion(dto: CreateQuestionDto) {
    const question = await this.questionModel.create(dto);
    return this.mapQuestion(question);
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const question = await this.questionModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return this.mapQuestion(question);
  }

  async deleteQuestion(id: string) {
    const question = await this.questionModel.findByIdAndDelete(id).exec();
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.testModel.updateMany({}, { $pull: { 'sections.$[].questionIds': new Types.ObjectId(id) } }).exec();

    return { success: true, message: 'Question deleted successfully' };
  }

  async filterQuestions(filters: FilterQuestionsDto) {
    const query: Record<string, unknown> = {};

    if (filters.subject) {
      query.subject = filters.subject;
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (filters.examTag) {
      query.examTags = filters.examTag;
    }

    const questions = await this.questionModel.find(query).sort({ createdAt: -1 }).exec();
    return questions.map((question) => this.mapQuestion(question));
  }

  async createTest(dto: CreateAdminTestDto) {
    await this.ensureExamExists(dto.examId);
    await this.ensureQuestionsExist(dto.sections.flatMap((section) => section.questionIds));

    const test = await this.testModel.create({
      examId: new Types.ObjectId(dto.examId),
      title: dto.title,
      sections: dto.sections.map((section) => ({
        name: section.name,
        questionIds: section.questionIds.map((questionId) => new Types.ObjectId(questionId)),
      })),
      marksPerQuestion: dto.marksPerQuestion,
      negativeMarks: dto.negativeMarks,
      duration: dto.duration,
      totalMarks: dto.totalMarks,
      isActive: false,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    });

    return this.getTestById(test.id);
  }

  async addQuestionsToSection(testId: string, sectionIndex: number, dto: AddSectionQuestionsDto) {
    const test = await this.findTestOrThrow(testId);
    const section = test.sections[sectionIndex];
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    await this.ensureQuestionsExist(dto.questionIds);

    const existingIds = new Set(section.questionIds.map((questionId) => String(questionId)));
    for (const questionId of dto.questionIds) {
      if (!existingIds.has(questionId)) {
        section.questionIds.push(new Types.ObjectId(questionId));
        existingIds.add(questionId);
      }
    }

    await test.save();
    return this.getTestById(test.id);
  }

  async removeQuestionFromSection(testId: string, sectionIndex: number, questionId: string) {
    const test = await this.findTestOrThrow(testId);
    const section = test.sections[sectionIndex];
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    section.questionIds = section.questionIds.filter((id) => String(id) !== questionId);
    await test.save();
    return this.getTestById(test.id);
  }

  async getTestById(testId: string) {
    const test = await this.findTestOrThrow(testId);

    const totalQuestions = test.sections.reduce((sum, section) => sum + section.questionIds.length, 0);
    return {
      id: test.id,
      examId: String(test.examId),
      title: test.title,
      sections: test.sections.map((section, index) => ({
        index,
        name: section.name,
        questionIds: section.questionIds.map((questionId) => String(questionId)),
        questionCount: section.questionIds.length,
      })),
      totalQuestions,
      marksPerQuestion: test.marksPerQuestion,
      negativeMarks: test.negativeMarks,
      duration: test.duration,
      totalMarks: test.totalMarks,
      isActive: test.isActive,
      expiresAt: test.expiresAt,
      createdAt: test.createdAt,
    };
  }

  async publishTest(testId: string) {
    const test = await this.findTestOrThrow(testId);
    const totalQuestions = test.sections.reduce((sum, section) => sum + section.questionIds.length, 0);
    const allSectionsHaveQuestions = test.sections.every((section) => section.questionIds.length > 0);
    const expectedMarks = totalQuestions * test.marksPerQuestion;

    if (!allSectionsHaveQuestions || totalQuestions <= 0 || test.totalMarks !== expectedMarks) {
      throw new BadRequestException('Test is incomplete. Add required questions before publishing.');
    }

    test.isActive = true;
    await test.save();
    return this.getTestById(test.id);
  }

  async unpublishTest(testId: string) {
    const test = await this.findTestOrThrow(testId);
    test.isActive = false;
    await test.save();
    return this.getTestById(test.id);
  }

  async deleteTest(testId: string) {
    const test = await this.findTestOrThrow(testId);
    test.isActive = false;
    test.expiresAt = new Date();
    await test.save();

    return {
      success: true,
      message: 'Test deactivated successfully',
      test: await this.getTestById(test.id),
    };
  }

  private async findTestOrThrow(testId: string) {
    const test = await this.testModel.findById(testId).exec();
    if (!test) {
      throw new NotFoundException('Test not found');
    }
    return test;
  }

  private async ensureExamExists(examId: string) {
    if (!isValidObjectId(examId)) {
      throw new BadRequestException('Invalid examId');
    }

    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException('Exam not found');
    }
  }

  private async ensureQuestionsExist(questionIds: string[]) {
    if (questionIds.length === 0) {
      return;
    }

    const uniqueQuestionIds = [...new Set(questionIds)];
    if (uniqueQuestionIds.some((questionId) => !isValidObjectId(questionId))) {
      throw new BadRequestException('One or more questionIds are invalid');
    }

    const count = await this.questionModel
      .countDocuments({ _id: { $in: uniqueQuestionIds.map((questionId) => new Types.ObjectId(questionId)) } })
      .exec();

    if (count !== uniqueQuestionIds.length) {
      throw new NotFoundException('One or more questionIds do not exist');
    }
  }

  private mapQuestion(question: QuestionDocument) {
    return {
      id: question.id,
      subject: question.subject,
      examTags: question.examTags,
      difficulty: question.difficulty,
      text: question.text,
      images: question.images,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      createdAt: question.createdAt,
    };
  }
}
