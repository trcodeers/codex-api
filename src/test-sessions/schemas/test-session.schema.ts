import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Test } from '../../tests/schemas/test.schema';

export type TestSessionDocument = HydratedDocument<TestSession>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class TestSession {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Test.name, required: true, index: true })
  testId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  startTime!: Date;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ required: true, min: 1 })
  duration!: number;

  @Prop({ enum: ['active', 'submitted', 'expired'], default: 'active' })
  status!: 'active' | 'submitted' | 'expired';

  @Prop({ type: Map, of: Number, default: {} })
  answers!: Map<string, number>;

  @Prop({ type: [String], default: [] })
  bookmarks!: string[];

  @Prop({ type: Date, default: () => new Date() })
  lastActivityAt!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const TestSessionSchema = SchemaFactory.createForClass(TestSession);
