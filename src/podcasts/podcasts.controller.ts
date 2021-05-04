import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PodcastService } from './podcasts.service';

@Controller('podcasts')
export class PodcastsController {
  constructor(private readonly podcastService: PodcastService) {}

  @Get()
  getAll() {
    return this.podcastService.getAll();
  }

  @Post()
  create(@Body() podcastData) {
    return this.podcastService.create(podcastData);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.podcastService.getOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateData) {
    return this.podcastService.update(id, updateData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.podcastService.delete(id);
  }
}
