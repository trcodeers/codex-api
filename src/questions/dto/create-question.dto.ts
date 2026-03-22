import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class CreateQuestionOptionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CreateQuestionDto {
  @IsString()
  subject!: string;

  @IsArray()
  @IsString({ each: true })
  examTags!: string[];

  @IsEnum(['Easy', 'Medium', 'Hard'])
  difficulty!: 'Easy' | 'Medium' | 'Hard';

  @IsString()
  text!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionOptionDto)
  options!: CreateQuestionOptionDto[];

  @IsNumber()
  @Min(0)
  correctAnswer!: number;

  @IsString()
  explanation!: string;
}
