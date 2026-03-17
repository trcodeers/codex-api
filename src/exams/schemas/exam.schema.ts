import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExamDocument = HydratedDocument<Exam>;

@Schema({ timestamps: false })
export class Exam {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  icon!: string;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
