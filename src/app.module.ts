import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ZipcodeService } from './zipcode.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [ZipcodeService],
})
export class AppModule {}
