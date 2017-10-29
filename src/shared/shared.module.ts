import { Module } from '@nestjs/common';
import { SayComponent } from './say.component';


@Module({
    components: [
        SayComponent,
    ],
    exports: [
        SayComponent,
    ],
})
export class SharedModule { }
