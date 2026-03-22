import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FilterQuestionsDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  examTag?: string;

  @IsOptional()
  @IsEnum(['Easy', 'Medium', 'Hard'])
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}
