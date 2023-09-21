import { Module } from '@nestjs/common';
import { AirportsModule } from './airports/airports.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AirportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
