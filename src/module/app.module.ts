import { Module } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
const ENV = process.env.NODE_ENV || 'development';
@Module({
  imports: [ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
    envFilePath: !ENV ? '.env' : `config/env/.${ENV}.env`,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
