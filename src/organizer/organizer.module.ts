import { Module } from '@nestjs/common';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';

@Module({
  controllers: [OrganizerController],
  providers: [OrganizerService],
})
export class OrganizerModule { }
