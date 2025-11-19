import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RaffleNumbersStatus } from './entities/raffle-numbers-status.entity';
import { RaffleNumbersStatusController } from './raffle-numbers-status.controller';
import { RaffleNumbersStatusService } from './raffle-numbers-status.service';

@Module({
    imports: [TypeOrmModule.forFeature([RaffleNumbersStatus])],
    controllers: [RaffleNumbersStatusController],
    providers: [RaffleNumbersStatusService],
})
export class RaffleNumbersStatusModule { }
