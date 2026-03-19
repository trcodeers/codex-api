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

  await Promise.all([
    examModel.deleteMany({}),
    testModel.deleteMany({}),
    questionModel.deleteMany({}),
    userModel.deleteMany({}),
  ]);

  const exams = await examModel.insertMany([
    { slug: 'upsc', name: 'UPSC', description: 'Union Public Service Commission - Civil Services Examination', isActive: true },
    { slug: 'ssc', name: 'SSC', description: 'Staff Selection Commission mock tests', isActive: true },
    { slug: 'banking', name: 'Banking', description: 'Bank PO and Clerk exam prep tests', isActive: true },
    { slug: 'railway', name: 'Railway', description: 'Railway recruitment board practice tests', isActive: true },
    { slug: 'jee', name: 'JEE', description: 'Joint Entrance Examination mock tests', isActive: true },
    { slug: 'neet', name: 'NEET', description: 'National Eligibility cum Entrance Test prep', isActive: true },
  ]);

  const examMap = new Map(exams.map((exam) => [exam.slug, exam._id as Types.ObjectId]));

  const questions = await questionModel.insertMany([
    {
      subject: 'Polity',
      examTags: ['UPSC'],
      difficulty: 'Easy',
      text: 'What is the capital of India?',
      images: ['https://picsum.photos/seed/india-capital/400/300'],
      options: [{ text: 'Mumbai' }, { text: 'Kolkata' }, { text: 'New Delhi' }, { text: 'Chennai' }],
      correctAnswer: 2,
      explanation: 'New Delhi is the capital of India.',
    },
    {
      subject: 'History',
      examTags: ['UPSC', 'SSC'],
      difficulty: 'Medium',
      text: 'Who wrote the Indian National Anthem?',
      options: [{ text: 'Bankim Chandra Chatterjee' }, { text: 'Rabindranath Tagore' }, { text: 'Sarojini Naidu' }, { text: 'Mahatma Gandhi' }],
      correctAnswer: 1,
      explanation: 'Rabindranath Tagore composed Jana Gana Mana.',
    },
    {
      subject: 'Quantitative Aptitude',
      examTags: ['SSC', 'Banking'],
      difficulty: 'Easy',
      text: 'What is 18 × 6?',
      options: [{ text: '96' }, { text: '108' }, { text: '118' }, { text: '128' }],
      correctAnswer: 1,
      explanation: '18 multiplied by 6 equals 108.',
    },
    {
      subject: 'Physics',
      examTags: ['JEE'],
      difficulty: 'Hard',
      text: 'Which quantity remains conserved in elastic collision?',
      options: [{ text: 'Only momentum' }, { text: 'Only kinetic energy' }, { text: 'Both momentum and kinetic energy' }, { text: 'Neither' }],
      correctAnswer: 2,
      explanation: 'In an elastic collision both momentum and kinetic energy are conserved.',
    },
    {
      subject: 'Biology',
      examTags: ['NEET'],
      difficulty: 'Medium',
      text: 'Identify the part of the human heart labeled "X" in the diagram below:',
      images: ['https://picsum.photos/seed/heart/400/300'],
      options: [
        { text: 'Left Atrium' },
        { text: 'Right Ventricle' },
        { text: 'Aorta' },
        { text: 'Pulmonary Artery' },
      ],
      correctAnswer: 2,
      explanation: 'The labeled structure X indicates the aorta in the diagram.',
    },
    {
      subject: 'Chemistry',
      examTags: ['NEET'],
      difficulty: 'Medium',
      text: 'Which of the following represents the correct structure of a water molecule?',
      options: [
        { text: 'Structure A', images: ['https://picsum.photos/seed/water1/150/100'] },
        { text: 'Structure B', images: ['https://picsum.photos/seed/water2/150/100'] },
        { text: 'Structure C', images: ['https://picsum.photos/seed/water3/150/100'] },
        { text: 'Structure D', images: ['https://picsum.photos/seed/water4/150/100'] },
      ],
      correctAnswer: 0,
      explanation: 'Structure A shows the correct bent molecular geometry of water.',
    },
  ]);

  const questionMap = new Map(questions.map((question) => [question.text, question._id as Types.ObjectId]));

  await testModel.insertMany([
    {
      examId: examMap.get('upsc'),
      title: 'UPSC Prelims Mock 1',
      sections: [
        {
          name: 'General Studies',
          questionIds: [
            questionMap.get('What is the capital of India?'),
            questionMap.get('Who wrote the Indian National Anthem?'),
          ],
        },
      ],
      marksPerQuestion: 2,
      negativeMarks: 0.66,
      duration: 60,
      totalMarks: 4,
      isActive: true,
    },
    {
      examId: examMap.get('ssc'),
      title: 'SSC CGL Quant Mock 1',
      sections: [
        {
          name: 'Quantitative Aptitude',
          questionIds: [questionMap.get('What is 18 × 6?')],
        },
      ],
      marksPerQuestion: 2,
      negativeMarks: 0.5,
      duration: 30,
      totalMarks: 2,
      isActive: true,
    },
    {
      examId: examMap.get('jee'),
      title: 'JEE Physics Mock 1',
      sections: [
        {
          name: 'Physics',
          questionIds: [questionMap.get('Which quantity remains conserved in elastic collision?')],
        },
      ],
      marksPerQuestion: 4,
      negativeMarks: 1,
      duration: 45,
      totalMarks: 4,
      isActive: true,
    },
    {
      examId: examMap.get('neet'),
      title: 'NEET Biology Visual Mock 1',
      sections: [
        {
          name: 'Biology Diagrams',
          questionIds: [
            questionMap.get('Identify the part of the human heart labeled "X" in the diagram below:'),
            questionMap.get('Which of the following represents the correct structure of a water molecule?'),
          ],
        },
      ],
      marksPerQuestion: 4,
      negativeMarks: 1,
      duration: 45,
      totalMarks: 8,
      isActive: true,
    },
  ]);

  const hashedPassword = await bcrypt.hash('12345', 10);
  await userModel.create({
    name: 'Sample User',
    email: 'sample@gmail.com',
    password: hashedPassword,
    role: 'Aspirant',
    goal: 'UPSC Civil Services',
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
