import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTestSectionDto {
  @IsString()
  name!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  questionIds!: string[];
}

export class CreateTestDto {
  @IsMongoId()
  examId!: string;

  @IsString()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTestSectionDto)
  sections!: CreateTestSectionDto[];

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

  @IsBoolean()
  isActive!: boolean;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
