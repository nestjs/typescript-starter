import { Module } from '@nestjs/common';
import { EpisodesController } from './episodes/episodes.controller';
import { EpisodesService } from './episodes/episodes.service';
import { PodcastsController } from './podcasts.controller';
import { PodcastService } from './podcasts.service';

@Module({
  imports: [],
  controllers: [PodcastsController, EpisodesController],
  providers: [PodcastService, EpisodesService],
})
export class PodcastsModule {}
