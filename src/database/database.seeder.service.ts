import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Exam, ExamDocument } from '../exams/schemas/exam.schema';
import { Test, TestDocument } from '../tests/schemas/test.schema';
import { Question, QuestionDocument } from '../questions/schemas/question.schema';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class DatabaseSeederService {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectModel(Exam.name) private readonly examModel: Model<ExamDocument>,
    @InjectModel(Test.name) private readonly testModel: Model<TestDocument>,
    @InjectModel(Question.name) private readonly questionModel: Model<QuestionDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seedOnStartup() {
    await this.seedExamsTestsQuestionsIfEmpty();
    await this.seedSampleUserIfMissing();
  }

  private async seedExamsTestsQuestionsIfEmpty() {
    const examsCount = await this.examModel.countDocuments();
    if (examsCount > 0) {
      this.logger.log('Exam data already present, skipping startup exam/test/question seed.');
      return;
    }

    const exams = await this.examModel.insertMany([
      { slug: 'upsc', name: 'UPSC', description: 'Union Public Service Commission - Civil Services Examination', icon: 'BookOpen' },
      { slug: 'ssc', name: 'SSC', description: 'Staff Selection Commission mock tests', icon: 'ClipboardList' },
      { slug: 'banking', name: 'Banking', description: 'Bank PO and Clerk exam prep tests', icon: 'Landmark' },
      { slug: 'railway', name: 'Railway', description: 'Railway recruitment board practice tests', icon: 'Train' },
      { slug: 'jee', name: 'JEE', description: 'Joint Entrance Examination mock tests', icon: 'Calculator' },
      { slug: 'neet', name: 'NEET', description: 'National Eligibility cum Entrance Test prep', icon: 'HeartPulse' },
    ]);

    const examMap = new Map(exams.map((exam) => [exam.slug, exam._id as Types.ObjectId]));

    const tests = await this.testModel.insertMany([
      { examId: examMap.get('upsc'), title: 'UPSC Prelims Mock 1', questionsCount: 50, duration: 60, totalMarks: 100, difficulty: 'Medium' },
      { examId: examMap.get('ssc'), title: 'SSC CGL Quant Mock 1', questionsCount: 25, duration: 30, totalMarks: 50, difficulty: 'Easy' },
      { examId: examMap.get('jee'), title: 'JEE Physics Mock 1', questionsCount: 30, duration: 45, totalMarks: 120, difficulty: 'Hard' },
    ]);

    const upscTest = tests.find((test) => test.title === 'UPSC Prelims Mock 1');
    const sscTest = tests.find((test) => test.title === 'SSC CGL Quant Mock 1');

    if (upscTest && sscTest) {
      await this.questionModel.insertMany([
        {
          testId: upscTest._id,
          text: 'What is the capital of India?',
          options: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'],
          correctAnswer: 2,
        },
        {
          testId: upscTest._id,
          text: 'Who wrote the Indian National Anthem?',
          options: ['Bankim Chandra Chatterjee', 'Rabindranath Tagore', 'Sarojini Naidu', 'Mahatma Gandhi'],
          correctAnswer: 1,
        },
        {
          testId: sscTest._id,
          text: 'What is 18 × 6?',
          options: ['96', '108', '118', '128'],
          correctAnswer: 1,
        },
      ]);
    }

    this.logger.log('Startup seed inserted default exams, tests, and questions.');
  }

  private async seedSampleUserIfMissing() {
    const email = 'sample@gmail.com';
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      this.logger.log('Sample user already present, skipping startup user seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('12345', 10);
    await this.userModel.create({
      name: 'Sample User',
      email,
      password: hashedPassword,
      role: 'Aspirant',
      goal: 'UPSC Civil Services',
      avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sample%20User',
      joinedDate: new Date(),
    });

    this.logger.log('Startup seed created sample user profile: sample@gmail.com (role: Aspirant).');
  }
}
