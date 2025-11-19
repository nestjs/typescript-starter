import { Controller, Get, Param } from '@nestjs/common';
import { RaffleNumbersService } from './raffle-number.service';

@Controller('raffle-numbers')
export class RaffleNumbersController {
    constructor(private readonly raffleNumbersService: RaffleNumbersService) { }

    @Get('raffle/:raffleId')
    findByRaffleId(@Param('raffleId') raffleId: string) {
        return this.raffleNumbersService.findByRaffleId(Number(raffleId));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.raffleNumbersService.findOne(Number(id));
    }
}
