import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { CatsController } from './Cat/cat.controller';
import { LoggerMiddleware } from './Cat/middleware/logger.midleware';
import { CatsModule } from './Cat/cat.module';

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(CatsController);
  }
}
