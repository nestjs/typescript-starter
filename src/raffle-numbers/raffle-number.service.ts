import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RaffleNumbers } from './entities/raffle-numbers.entity';

@Injectable()
export class RaffleNumbersService {
    constructor(
        @InjectRepository(RaffleNumbers)
        private raffleNumbersRepository: Repository<RaffleNumbers>,
    ) { }

    async findOne(id: number): Promise<RaffleNumbers | null> {
        return await this.raffleNumbersRepository.findOne({ where: { id } });
    }

    async findByRaffleId(raffleId: number): Promise<RaffleNumbers[]> {
        return await this.raffleNumbersRepository.find({
            where: { raffleId },
            relations: ['client', 'raffleNumbersStatus'],
        });
    }
}
