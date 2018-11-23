import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { ConfigService } from './app/config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config: ConfigService = app.get('ConfigService');

  await app.listen(config.port);
}
bootstrap();
