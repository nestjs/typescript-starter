import { Test, TestingModule } from '@nestjs/testing';
import { ProcedimentService } from './procediment.service';

describe('ProcedimentService', () => {
  let service: ProcedimentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcedimentService],
    }).compile();

    service = module.get<ProcedimentService>(ProcedimentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
