import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Test } from '../../tests/schemas/test.schema';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Test.name, required: true, index: true })
  testId!: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  score!: number;

  @Prop({ required: true, min: 0, default: 0 })
  total!: number;

  @Prop({ required: true, min: 0, default: 0 })
  correct!: number;

  @Prop({ required: true, min: 0, default: 0 })
  wrong!: number;

  @Prop({ required: true, min: 0, default: 0 })
  timeTaken!: number;

  @Prop({ type: Date, required: true, default: () => new Date() })
  startTime!: Date;

  @Prop({ required: true, min: 0, default: 0 })
  duration!: number;

  @Prop({ enum: ['active', 'submitted', 'expired'], default: 'active', index: true })
  status!: 'active' | 'submitted' | 'expired';

  @Prop({ type: Map, of: Number, default: {} })
  answers!: Map<string, number>;

  @Prop({ type: Map, of: String, default: {} })
  questionStatuses!: Map<string, string>;

  @Prop({ type: [String], default: [] })
  bookmarks!: string[];

  @Prop({ type: Date, default: () => new Date() })
  lastActivityAt!: Date;

  @Prop({ type: Date })
  submittedAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
