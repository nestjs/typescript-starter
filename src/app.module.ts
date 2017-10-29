import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';


@Module({
    modules: [
        CoreModule,
    ],
})
export class AppModule { }
