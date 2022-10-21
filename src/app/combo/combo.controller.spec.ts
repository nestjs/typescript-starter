import { TestingModule, Test } from '@nestjs/testing';
import { ComboController } from './combo.controller';

describe('ComboController', () => {
  let controller: ComboController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboController],
    }).compile();

    controller = module.get<ComboController>(ComboController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
