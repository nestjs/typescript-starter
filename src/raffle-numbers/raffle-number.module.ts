import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleNumbers } from './entities/raffle-numbers.entity';
import { RaffleNumbersController } from './raffle-numbers.controller';
import { RaffleNumbersService } from './raffle-number.service';

@Module({
    imports: [TypeOrmModule.forFeature([RaffleNumbers])],
    controllers: [RaffleNumbersController],
    providers: [RaffleNumbersService],
})
export class RaffleNumbersModule { } 
