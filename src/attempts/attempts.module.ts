import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attempt, AttemptSchema } from './schemas/attempt.schema';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { TestsModule } from '../tests/tests.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Attempt.name, schema: AttemptSchema }]), TestsModule],
  controllers: [AttemptsController],
  providers: [AttemptsService],
})
export class AttemptsModule {}
