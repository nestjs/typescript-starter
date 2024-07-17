import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { EventService } from 'src/event/event.service';
import { OrganizerService } from 'src/organizer/organizer.service';
import { VolunteerService } from 'src/volunteer/volunteer.service';

@Module({
  imports: [
    MulterModule.register({
      dest: 'C:/Users/980185/Desktop/Faculdade/Projeto integrador/back/src/upload',
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, VolunteerService, OrganizerService, EventService],
})
export class UploadModule {}
