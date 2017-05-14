import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './modules/app.module';

const app = NestFactory.create(ApplicationModule);
app.listen(3000, () => console.log('Application is listening on port 3000.'));