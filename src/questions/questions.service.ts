import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(@InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>) {}

  async findByTestId(testId: string) {
    const questions = await this.questionModel.find({ testId }).exec();
    return questions.map((question) => ({
      id: question.id,
      testId,
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
    }));
  }
}
