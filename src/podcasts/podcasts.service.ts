import { Injectable, NotFoundException } from '@nestjs/common';
import { Podcast } from './entities/podcast.entity';

@Injectable()
export class PodcastService {
  private podcasts: Podcast[] = [];

  getAll() {
    return this.podcasts;
  }

  create(podcastData: Podcast) {
    this.podcasts.push({
      id: this.podcasts.length + 1,
      ...podcastData,
    });
  }

  getOne(id: string): Podcast {
    const podcast = this.podcasts.find((podcast) => podcast.id === +id);
    if (!podcast) {
      throw new NotFoundException(`Popcast Not Found => id: ${id}`);
    }
    return podcast;
  }

  delete(id: string) {
    this.getOne(id);
    this.podcasts = this.podcasts.filter((podcast) => podcast.id !== +id);
  }

  update(id: string, updateData: Podcast) {
    const podcast = this.getOne(id);
    this.delete(id);
    this.podcasts.push({ ...podcast, ...updateData });
  }
}
