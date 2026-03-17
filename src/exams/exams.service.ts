import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './schemas/exam.schema';

@Injectable()
export class ExamsService {
  constructor(@InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>) {}

  async findAll() {
    const exams = await this.examModel.find().sort({ name: 1 }).exec();
    return exams.map((exam) => ({
      id: exam.slug,
      name: exam.name,
      description: exam.description,
      icon: exam.icon,
    }));
  }
}
