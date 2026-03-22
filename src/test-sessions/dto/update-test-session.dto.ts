import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateTestSessionDto {
  @IsOptional()
  @IsObject()
  answers?: Record<string, number>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bookmarks?: string[];
}
