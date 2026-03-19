import { IsMongoId, IsNumber, IsObject, Min } from 'class-validator';

export class CreateAttemptDto {
  @IsMongoId()
  testId!: string;

  @IsNumber()
  @Min(0)
  score!: number;

  @IsNumber()
  @Min(0)
  total!: number;

  @IsNumber()
  @Min(0)
  correct!: number;

  @IsNumber()
  @Min(0)
  wrong!: number;

  @IsNumber()
  @Min(0)
  timeTaken!: number;

  @IsObject()
  answers!: Record<string, number>;
}
