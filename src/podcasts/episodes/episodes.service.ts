import { Injectable, NotFoundException } from '@nestjs/common';
import { Episode } from '../entities/episode.entity';
import { Podcast } from '../entities/podcast.entity';
import { PodcastService } from '../podcasts.service';

@Injectable()
export class EpisodesService {
  private podcast: Podcast;

  constructor(private readonly podcastService: PodcastService) {}

  getAll(id: string): Episode[] {
    this.podcast = this.podcastService.getOne(id);
    if (!this.podcast.episodes) {
      this.podcast.episodes = [];
    }
    return this.podcast.episodes;
  }

  create(id: string, episodeData: Episode) {
    this.getAll(id);
    this.podcast.episodes.push({
      id: this.podcast.episodes.length + 1,
      ...episodeData,
    });
    this.podcastService.update(id, this.podcast);
  }

  getOne(id: string, episodeId: string): Episode {
    this.getAll(id);
    const episode = this.podcast.episodes.find(
      (episode) => episode.id === +episodeId,
    );
    if (!episode) {
      throw new NotFoundException(
        `Episode Not Found in Podcast id:${id} => episodeId: ${episodeId}`,
      );
    }
    return episode;
  }

  delete(id: string, episodeId: string) {
    this.getOne(id, episodeId);
    this.podcast.episodes = this.podcast.episodes.filter(
      (episode) => episode.id !== +episodeId,
    );
    this.podcastService.update(id, this.podcast);
  }

  update(id: string, episodeId: string, updateData: Episode) {
    const episode = this.getOne(id, episodeId);
    this.delete(id, episodeId);
    this.podcast.episodes.push({
      ...episode,
      ...updateData,
    });
    this.podcastService.update(id, this.podcast);
  }
}
