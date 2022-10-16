import { Test, TestingModule } from '@nestjs/testing';
import { ClinicController } from './clinic.controller';
import { ClinicService } from './clinic.service';

describe('ClinicController', () => {
  let controller: ClinicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClinicController],
      providers: [ClinicService],
    }).compile();

    controller = module.get<ClinicController>(ClinicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
