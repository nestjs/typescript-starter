import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { VolunteerService } from '../volunteer/volunteer.service';
import { OrganizerService } from '../organizer/organizer.service';
import { EventService } from '../event/event.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly volunteerService: VolunteerService,
    private readonly organizerService: OrganizerService,
    private readonly eventService: EventService,
  ) { }

  @Post('volunteer/:id')
  @ApiOperation({ summary: 'Upload image for volunteer' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadVolunteerImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const image = await this.uploadService.uploadImage(file, 'volunteer');
    await this.volunteerService.update(id, { imageId: image.id });
    return { url: image.url };
  }

  @Post('organizer/:id')
  @ApiOperation({ summary: 'Upload image for organizer' })
  @ApiResponse({
    status: 201,
    description: 'The image has been successfully uploaded.',
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadOrganizerImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const image = await this.uploadService.uploadImage(file, 'organizer');
    await this.organizerService.update(id, { imageId: image.id });
    return { url: image.url };
  }

  @Post('banner/:eventId')
  @ApiOperation({ summary: 'Upload banner for event' })
  @ApiResponse({
    status: 201,
    description: 'The banner has been successfully uploaded.',
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadBanner(
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const banner = await this.uploadService.uploadBanner(file);
    await this.eventService.update(eventId, { bannerId: banner.id });
    return { url: banner.url };
  }

  @Get('volunteer/:id/photo')
  @ApiOperation({ summary: 'Get photo URL for volunteer' })
  @ApiResponse({
    status: 200,
    description: 'Returns the photo URL for the volunteer.',
  })
  async getVolunteerPhotoUrl(@Param('id') id: string) {
    const volunteer = await this.volunteerService.findOne(id);
    if (!volunteer) {
      throw new NotFoundException('Volunteer not found');
    }
    if (!volunteer.imageId) {
      throw new NotFoundException('Photo not found for the volunteer');
    }
    return this.uploadService.getImageUrl(volunteer.imageId);
  }

  @Get('organizer/:id/photo')
  @ApiOperation({ summary: 'Get photo URL for organizer' })
  @ApiResponse({
    status: 200,
    description: 'Returns the photo URL for the organizer.',
  })
  async getOrganizerPhotoUrl(@Param('id') id: string) {
    const organizer = await this.organizerService.findOne(id);
    if (!organizer) {
      throw new NotFoundException('Organizer not found');
    }
    if (!organizer.imageId) {
      throw new NotFoundException('Photo not found for the organizer');
    }
    return this.uploadService.getImageUrl(organizer.imageId);
  }

  @Get('event/:id/banner')
  @ApiOperation({ summary: 'Get banner URL for event' })
  @ApiResponse({
    status: 200,
    description: 'Returns the banner URL for the event.',
  })
  async getEventBannerUrl(@Param('id') id: string) {
    const event = await this.eventService.findOne(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    if (!event.bannerId) {
      throw new NotFoundException('Banner not found for the event');
    }
    return this.uploadService.getBannerUrl(event.bannerId);
  }
}
