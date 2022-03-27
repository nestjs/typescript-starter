import { Controller, Get, Post, Body, Logger } from '@nestjs/common';
import { Bet } from './bet.entity';
import { BetService } from './bet.service';

@Controller("Bet")
export class BetController {
  constructor(private BetsService: BetService) {}

  @Post()
  async create(@Body() createBetDto: Bet) {
    Logger.log("NEW Bet POST REQUEST WITH FOLLOWING PARAMS " + createBetDto.date + createBetDto.id + createBetDto.number)
    return this.BetsService.create(createBetDto);
  }

  @Get()
  async findAll(): Promise<Bet[]> {
    Logger.log("GET ALL BetS")
    return this.BetsService.findAll();
  }
}