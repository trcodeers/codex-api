import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { TestsModule } from '../tests/tests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]), TestsModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService, MongooseModule],
})
export class ExamsModule {}
