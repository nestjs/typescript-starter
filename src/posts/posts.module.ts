import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import Post from './post.entity';
import PostsController from './posts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule { }
