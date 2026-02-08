import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LabModule } from './lab/lab.module';

@Module({
  imports: [LabModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
