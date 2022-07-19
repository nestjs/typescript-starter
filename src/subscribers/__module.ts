import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import SubscriberController from './__controller';
import SubscriberEntity from './__entity';
import SubscriberService from './__service';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriberEntity])],
  providers: [SubscriberService],
  controllers: [SubscriberController],
  exports: [SubscriberService],
})
export default class SubscriberModule {}
