import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  /**
   * One of the requirements for the project is to log the contents in JSON format,
   * so lets use the pino logger because it logs in JSON by default.
   */
  app.useLogger(app.get(Logger));
  await app.listen(3000);
}
bootstrap();
