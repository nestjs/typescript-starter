import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Token])],
    providers: [TokenService],
    exports: [TokenService],
})

export class TokenModule {}