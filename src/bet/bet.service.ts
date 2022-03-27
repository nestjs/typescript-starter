import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bet } from './bet.entity';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(Bet)
    private BetsRepository: Repository<Bet>,
  ) {}

  findAll(): Promise<Bet[]> {
    return this.BetsRepository.find();
  }

  findOne(id: string): Promise<Bet> {
    return this.BetsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.BetsRepository.delete(id);
  }

  create(newBet: Bet): void {
    this.BetsRepository.insert(newBet);
  }
}