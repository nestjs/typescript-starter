import { Test, TestingModule } from '@nestjs/testing';
import { RaffleNumbersController } from './raffle-numbers.controller';

describe('RaffleNumbersController', () => {
  let controller: RaffleNumbersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleNumbersController],
    }).compile();

    controller = module.get<RaffleNumbersController>(RaffleNumbersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
