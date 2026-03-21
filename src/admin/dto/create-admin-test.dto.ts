import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsMongoId, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class CreateAdminTestSectionDto {
  @IsString()
  name!: string;

  @IsArray()
  @IsMongoId({ each: true })
  questionIds!: string[];
}

export class CreateAdminTestDto {
  @IsMongoId()
  examId!: string;

  @IsString()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateAdminTestSectionDto)
  sections!: CreateAdminTestSectionDto[];

  @IsNumber()
  @Min(0)
  marksPerQuestion!: number;

  @IsNumber()
  @Min(0)
  negativeMarks!: number;

  @IsNumber()
  @Min(1)
  duration!: number;

  @IsNumber()
  @Min(0)
  totalMarks!: number;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
