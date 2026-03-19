import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';
import { TestsService } from '../tests/tests.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    private readonly testsService: TestsService,
  ) {}

  async findByTestId(testId: string) {
    const test = await this.testsService.findById(testId);
    const questionIds = test.sections.flatMap((section) => section.questionIds);
    const questions = await this.questionModel.find({ _id: { $in: questionIds } }).exec();
    const questionMap = new Map(questions.map((question) => [question.id, question]));

    const orderedQuestions: QuestionDocument[] = [];
    for (const questionId of questionIds) {
      const question = questionMap.get(String(questionId));
      if (question) {
        orderedQuestions.push(question);
      }
    }

    return orderedQuestions.map((question) => ({
      id: question.id,
      subject: question.subject,
      examTags: question.examTags,
      difficulty: question.difficulty,
      text: question.text,
      images: question.images,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    }));
  }
}
