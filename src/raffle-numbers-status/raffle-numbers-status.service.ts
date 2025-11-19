import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RaffleNumbersStatus } from './entities/raffle-numbers-status.entity';

@Injectable()
export class RaffleNumbersStatusService {
    constructor(
        @InjectRepository(RaffleNumbersStatus)
        private raffleNumbersStatusRepository: Repository<RaffleNumbersStatus>,
    ) { }


    async findOne(id: number) {
        return await this.raffleNumbersStatusRepository.findOne({ where: { id } });
    }


}
