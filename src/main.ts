import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config({ path: __dirname + `/.env.${process.env.NODE_ENV}` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Use global validation pipe
   */
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
