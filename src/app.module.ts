import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostcodeController } from './postcode/postcode.controller';
import { PostcodeService } from './postcode/postcode.service';

@Module({
  imports: [],
  controllers: [AppController, PostcodeController],
  providers: [AppService, PostcodeService],
})
export class AppModule {}
