import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TimeoutInterceptor } from './timeout.interceptor';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalInterceptors(new TimeoutInterceptor());
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
