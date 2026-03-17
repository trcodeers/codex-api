import { IsEnum, IsMongoId, IsNumber, IsString, Min } from 'class-validator';

export class CreateTestDto {
  @IsMongoId()
  examId!: string;

  @IsString()
  title!: string;

  @IsNumber()
  @Min(1)
  questionsCount!: number;

  @IsNumber()
  @Min(1)
  duration!: number;

  @IsNumber()
  @Min(1)
  totalMarks!: number;

  @IsEnum(['Easy', 'Medium', 'Hard'])
  difficulty!: 'Easy' | 'Medium' | 'Hard';
}
