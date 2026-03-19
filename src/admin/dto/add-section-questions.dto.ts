import { ArrayMinSize, IsArray, IsMongoId } from 'class-validator';

export class AddSectionQuestionsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  questionIds!: string[];
}
