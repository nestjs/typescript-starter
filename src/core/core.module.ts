import { Module } from '@nestjs/common';
import { SharedModule } from './../shared/shared.module';
import { HelloWorldController } from './hello-world/hello-world.controller';


@Module({
    modules: [
        SharedModule,
    ],
    controllers: [
        HelloWorldController,
    ],
})
export class CoreModule { }
