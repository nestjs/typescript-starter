import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackModule } from './track/track.module';
import { TrackController } from './track/track.controller';
import { TrackService } from './track/track.service';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@mongo-cluster.wx2wr.mongodb.net/?retryWrites=true&w=majority&appName=mongo-cluster',
    ),
    TrackModule,
  ],
  controllers: [TrackController],
  providers: [TrackService],
})
export class AppModule {}
