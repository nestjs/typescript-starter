import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Starter API')
    .setDescription('A comprehensive API with admin user seeder functionality')
    .setVersion('1.0')
    .addTag('users', 'User management endpoints')
    .addTag('cats', 'Cat management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

void bootstrap();
