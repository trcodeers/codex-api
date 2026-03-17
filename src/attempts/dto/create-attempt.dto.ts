import { IsMongoId, IsNumber, IsObject, IsString, Min } from 'class-validator';

export class CreateAttemptDto {
  @IsMongoId()
  testId!: string;

  @IsNumber()
  @Min(0)
  score!: number;

  @IsNumber()
  @Min(1)
  total!: number;

  @IsString()
  timeTaken!: string;

  @IsObject()
  answers!: Record<string, number>;
}
