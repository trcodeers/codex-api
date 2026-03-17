import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Exam } from '../../exams/schemas/exam.schema';

export type TestDocument = HydratedDocument<Test>;

@Schema({ timestamps: false })
export class Test {
  @Prop({ type: Types.ObjectId, ref: Exam.name, required: true, index: true })
  examId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, min: 1 })
  questionsCount!: number;

  @Prop({ required: true, min: 1 })
  duration!: number;

  @Prop({ required: true, min: 1 })
  totalMarks!: number;

  @Prop({ enum: ['Easy', 'Medium', 'Hard'], required: true })
  difficulty!: 'Easy' | 'Medium' | 'Hard';
}

export const TestSchema = SchemaFactory.createForClass(Test);
