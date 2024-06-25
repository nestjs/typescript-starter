import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventModule } from './event/event.module';
import { OrganizerModule } from './organizer/organizer.module';
import { VolunteerModule } from './volunteer/volunteer.module';

@Module({
  imports: [EventModule, OrganizerModule, VolunteerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
