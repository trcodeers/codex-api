import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exam } from '../../exams/schemas/exam.schema';
import { Question } from '../../questions/schemas/question.schema';

export type TestDocument = HydratedDocument<Test>;

@Schema({ _id: false })
export class TestSection {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: Question.name }], default: [] })
  questionIds!: Types.ObjectId[];
}

const TestSectionSchema = SchemaFactory.createForClass(TestSection);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Test {
  @Prop({ type: Types.ObjectId, ref: Exam.name, required: true, index: true })
  examId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: [TestSectionSchema], default: [] })
  sections!: TestSection[];

  @Prop({ required: true, min: 0 })
  marksPerQuestion!: number;

  @Prop({ required: true, min: 0, default: 0 })
  negativeMarks!: number;

  @Prop({ required: true, min: 1 })
  duration!: number;

  @Prop({ required: true, min: 0 })
  totalMarks!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  expiresAt?: Date;

  createdAt!: Date;
}

export const TestSchema = SchemaFactory.createForClass(Test);
