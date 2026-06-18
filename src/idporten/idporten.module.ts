import { Module } from '@nestjs/common';
import { IdportenService } from './idporten.service';
import { TokenModule } from '../token/token.module';

@Module({
    imports: [TokenModule],
    providers: [IdportenService],
    exports: [IdportenService],
})

export class IdportenModule {}
