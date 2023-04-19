import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { TimeoutInterceptor } from './timeout.interceptor';

// set globalprefix with api, and tried using  interceptors to catch the timeout exception but no luck
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // app.useGlobalInterceptors(new TimeoutInterceptor());
    app.setGlobalPrefix('api');
    await app.listen(3000);
}
bootstrap();
