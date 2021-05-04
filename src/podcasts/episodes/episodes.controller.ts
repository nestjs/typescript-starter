import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EpisodesService } from './episodes.service';

@Controller('podcasts/:id')
export class EpisodesController {
  constructor(private readonly episodesService: EpisodesService) {}

  @Get('episodes')
  getAll(@Param('id') id: string) {
    return this.episodesService.getAll(id);
  }

  @Post('episodes')
  create(@Param('id') id: string, @Body() episodeData) {
    return this.episodesService.create(id, episodeData);
  }

  @Get('episodes/:episodeId')
  getOne(@Param('id') id: string, @Param('episodeId') episodeId: string) {
    return this.episodesService.getOne(id, episodeId);
  }

  @Patch('episodes/:episodeId')
  update(
    @Param('id') id: string,
    @Param('episodeId') episodeId: string,
    @Body() updateData,
  ) {
    return this.episodesService.update(id, episodeId, updateData);
  }

  @Delete('episodes/:episodeId')
  delete(@Param('id') id: string, @Param('episodeId') episodeId: string) {
    return this.episodesService.delete(id, episodeId);
  }
}
