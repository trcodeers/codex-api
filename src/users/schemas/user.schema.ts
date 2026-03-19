import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class User {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ enum: ['Aspirant', 'Admin'], default: 'Aspirant' })
  role!: 'Aspirant' | 'Admin';

  @Prop({ default: '' })
  goal!: string;

  createdAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
