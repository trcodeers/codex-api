import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Test } from '../../tests/schemas/test.schema';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: false })
export class Question {
  @Prop({ type: Types.ObjectId, ref: Test.name, required: true, index: true })
  testId!: Types.ObjectId;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [String], required: true })
  options!: string[];

  @Prop({ required: true, min: 0 })
  correctAnswer!: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
