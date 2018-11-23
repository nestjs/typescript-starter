import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { TypeOrmConfigService } from './typeorm/typeorm.config.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => {
        new ClassSerializerInterceptor(reflector);
      },
      inject: [Reflector],
    },
    {
      provide: APP_PIPE,
      useFactory: (config: ConfigService) => {
        new ValidationPipe({
          disableErrorMessages: config.isProdEnvironment,
          transform: true,
          whitelist: true,
        });
      },
      inject: [ConfigService],
    },
    AppService,
  ],
})
export class AppModule {}
