import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';

describe('SchedulingService', () => {
  let service: SchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulingService],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
