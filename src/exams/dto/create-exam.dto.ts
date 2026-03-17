import { IsString } from 'class-validator';

export class CreateExamDto {
  @IsString()
  slug!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  icon!: string;
}
