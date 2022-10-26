import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}
