import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class UpdateQuestionOptionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  examTags?: string[];

  @IsOptional()
  @IsEnum(['Easy', 'Medium', 'Hard'])
  difficulty?: 'Easy' | 'Medium' | 'Hard';

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuestionOptionDto)
  options?: UpdateQuestionOptionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  correctAnswer?: number;

  @IsOptional()
  @IsString()
  explanation?: string;
}
