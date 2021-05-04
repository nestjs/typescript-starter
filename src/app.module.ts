import { Module } from '@nestjs/common';
import { PodcastsModule } from './podcasts/podcasts.module';

@Module({
  imports: [PodcastsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
