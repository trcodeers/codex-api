import { NestFactory } from '@nestjs/core';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import configuration from '../config/configuration';
import { validateEnv } from '../config/validate-env';
import { Exam, ExamSchema } from '../exams/schemas/exam.schema';
import { Test, TestSchema } from '../tests/schemas/test.schema';
import { Question, QuestionSchema } from '../questions/schemas/question.schema';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], validate: validateEnv }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({ uri: configService.get<string>('mongo.uri') }),
    }),
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: Test.name, schema: TestSchema },
      { name: Question.name, schema: QuestionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
})
class SeedModule {}

async function seed() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const examModel = app.get<Model<Exam>>(getModelToken(Exam.name));
  const testModel = app.get<Model<Test>>(getModelToken(Test.name));
  const questionModel = app.get<Model<Question>>(getModelToken(Question.name));
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  await Promise.all([examModel.deleteMany({}), testModel.deleteMany({}), questionModel.deleteMany({}), userModel.deleteMany({})]);

  const exams = await examModel.insertMany([
    { slug: 'upsc', name: 'UPSC', description: 'Union Public Service Commission - Civil Services Examination', icon: 'BookOpen' },
    { slug: 'ssc', name: 'SSC', description: 'Staff Selection Commission mock tests', icon: 'ClipboardList' },
    { slug: 'banking', name: 'Banking', description: 'Bank PO and Clerk exam prep tests', icon: 'Landmark' },
    { slug: 'railway', name: 'Railway', description: 'Railway recruitment board practice tests', icon: 'Train' },
    { slug: 'jee', name: 'JEE', description: 'Joint Entrance Examination mock tests', icon: 'Calculator' },
    { slug: 'neet', name: 'NEET', description: 'National Eligibility cum Entrance Test prep', icon: 'HeartPulse' },
  ]);

  const examMap = new Map(exams.map((exam) => [exam.slug, exam._id as Types.ObjectId]));

  const tests = await testModel.insertMany([
    { examId: examMap.get('upsc'), title: 'UPSC Prelims Mock 1', questionsCount: 50, duration: 60, totalMarks: 100, difficulty: 'Medium' },
    { examId: examMap.get('ssc'), title: 'SSC CGL Quant Mock 1', questionsCount: 25, duration: 30, totalMarks: 50, difficulty: 'Easy' },
    { examId: examMap.get('jee'), title: 'JEE Physics Mock 1', questionsCount: 30, duration: 45, totalMarks: 120, difficulty: 'Hard' },
  ]);

  const upscTest = tests.find((test) => test.title === 'UPSC Prelims Mock 1');
  const sscTest = tests.find((test) => test.title === 'SSC CGL Quant Mock 1');

  if (upscTest && sscTest) {
    await questionModel.insertMany([
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
      {
        testId: sscTest._id,
        text: 'Square root of 144 is?',
        options: ['10', '11', '12', '14'],
        correctAnswer: 2,
      },
    ]);
  }

  const hashedPassword = await bcrypt.hash('12345', 10);
  await userModel.create({
    name: 'Sample User',
    email: 'sample@gmail.com',
    password: hashedPassword,
    role: 'Aspirant',
    goal: 'UPSC Civil Services',
    avatar: 'https://api.dicebear.com/9.x/initials/svg?seed=Sample%20User',
    joinedDate: new Date(),
  });

  // eslint-disable-next-line no-console
  console.log('Seeded sample user profile: sample@gmail.com (role: Aspirant)');

  // eslint-disable-next-line no-console
  console.log('Seed completed successfully');
  await app.close();
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed', error);
  process.exit(1);
});
