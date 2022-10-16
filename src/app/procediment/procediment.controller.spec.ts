import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimentController } from './procediment.controller';

describe('ProcedimentController', () => {
  let controller: ProcedimentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedimentController],
    }).compile();

    controller = module.get<ProcedimentController>(ProcedimentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
