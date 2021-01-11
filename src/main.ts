import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './module/app.module';
import { FastifyAdapter, NestFastifyApplication, } from '@nestjs/platform-fastify';
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: true });
  const configService = app.get(ConfigService);
  const PORT = configService.get('port')
  await app.listen(PORT);
  const url = await app.getUrl()
  console.log('Running on : ', url)
}
bootstrap();
