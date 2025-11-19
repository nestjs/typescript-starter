import { Test, TestingModule } from '@nestjs/testing';
import { RaffleNumbersStatusController } from './raffle-numbers-status.controller';

describe('RaffleNumbersStatusController', () => {
  let controller: RaffleNumbersStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaffleNumbersStatusController],
    }).compile();

    controller = module.get<RaffleNumbersStatusController>(
      RaffleNumbersStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
