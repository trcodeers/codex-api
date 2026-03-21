import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Test } from '../../tests/schemas/test.schema';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Test.name, required: true, index: true })
  testId!: Types.ObjectId;

  @Prop({ required: true })
  score!: number;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ required: true, min: 0, default: 0 })
  correct!: number;

  @Prop({ required: true, min: 0, default: 0 })
  wrong!: number;

  @Prop({ required: true, min: 0 })
  timeTaken!: number;

  @Prop({ type: Map, of: Number, default: {} })
  answers!: Map<string, number>;

  createdAt!: Date;
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);
