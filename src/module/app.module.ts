import { Module } from '@nestjs/common';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../config/configuration';
import { AuthModule } from './auth.module';
const ENV = process.env.NODE_ENV || 'development';
@Module({
  imports: [ConfigModule.forRoot({
    load: [configuration],
    isGlobal: true,
    envFilePath: !ENV ? '.env' : `config/env/.${ENV}.env`,
  }),AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
