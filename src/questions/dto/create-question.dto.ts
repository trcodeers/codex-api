import { ArrayMinSize, IsArray, IsMongoId, IsNumber, IsString, Min } from 'class-validator';

export class CreateQuestionDto {
  @IsMongoId()
  testId!: string;

  @IsString()
  text!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsNumber()
  @Min(0)
  correctAnswer!: number;
}
