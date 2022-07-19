import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import SubscriberModule from './subscribers/__module';
import { AppController } from './__app.controller';
import { AppService } from './__app.service';
import { DatabaseModule } from './__db.module';

@Module({
  imports: [ConfigModule.forRoot({}), SubscriberModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
