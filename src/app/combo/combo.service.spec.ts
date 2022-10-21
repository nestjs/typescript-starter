import { TestingModule, Test } from '@nestjs/testing';
import { ComboService } from './combo.service';

describe('ComboService', () => {
  let service: ComboService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboService],
    }).compile();

    service = module.get<ComboService>(ComboService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
