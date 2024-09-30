import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { TrackSchema } from 'src/schemas/track.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from 'src/schemas/comment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Track', schema: TrackSchema }]),
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
  controllers: [TrackController],
  providers: [TrackService],
})
export class TrackModule {}
