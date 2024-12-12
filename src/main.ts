import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS usando enableCors
  app.enableCors({
    origin: 'http://localhost:3001' || 'https://connect-tech-api-main.vercel.app', // Adicione a origem permitida aqui
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Se precisar permitir cookies entre diferentes origens
  });

  const config = new DocumentBuilder()
    .setTitle('API-MAIN  --- ConnectTech')
    .setDescription('Connect Tech ')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
