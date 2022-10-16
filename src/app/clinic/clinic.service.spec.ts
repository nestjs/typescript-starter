import { Test, TestingModule } from '@nestjs/testing';
import { ClinicService } from './clinic.service';

describe('ClinicService', () => {
  let service: ClinicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClinicService],
    }).compile();

    service = module.get<ClinicService>(ClinicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
