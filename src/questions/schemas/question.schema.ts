import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ _id: false })
export class QuestionOption {
  @Prop({ default: '' })
  text!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];
}

const QuestionOptionSchema = SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Question {
  @Prop({ required: true, trim: true })
  subject!: string;

  @Prop({ type: [String], default: [] })
  examTags!: string[];

  @Prop({ enum: ['Easy', 'Medium', 'Hard'], required: true })
  difficulty!: 'Easy' | 'Medium' | 'Hard';

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ type: [QuestionOptionSchema], required: true })
  options!: QuestionOption[];

  @Prop({ required: true, min: 0 })
  correctAnswer!: number;

  @Prop({ default: '' })
  explanation!: string;

  createdAt!: Date;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
