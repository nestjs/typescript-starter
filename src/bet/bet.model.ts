import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BetService } from './bet.service';
import { BetController } from './bet.controller';
import { Bet } from './bet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bet])],
  providers: [BetService],
  controllers: [BetController],
})
export class BetModel {}