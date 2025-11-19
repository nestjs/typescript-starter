import { Controller, Get, Param } from '@nestjs/common';
import { RaffleNumbersStatusService } from './raffle-numbers-status.service';

@Controller('raffle-numbers-status')
export class RaffleNumbersStatusController {
    constructor(
        private readonly raffleNumbersStatusService: RaffleNumbersStatusService,
    ) { }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.raffleNumbersStatusService.findOne(Number(id));
    }

}
