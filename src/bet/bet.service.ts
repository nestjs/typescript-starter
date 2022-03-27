import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { range } from 'rxjs';
import { Between, InsertResult, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Bet } from './bet.entity';

@Injectable()
export class BetService {
  constructor(
    @InjectRepository(Bet)
    private BetsRepository: Repository<Bet>,
  ) { }

  findAll(): Promise<Bet[]> {
    return this.BetsRepository.find();
  }

  findOne(id: number): Promise<Bet> {
    return this.BetsRepository.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.BetsRepository.delete(id);
  }

  create(newBet: Bet): Promise<InsertResult> {
    return this.BetsRepository.insert(newBet);
  }

  findLatest(): Promise<Bet> {
    return this.BetsRepository.findOne(
      {
        where: {
          odds: Between(1, 10),
          ev: MoreThan(5),
          placed: false
        },
        order: {
          id: 'DESC'
        }
      });
  }
}