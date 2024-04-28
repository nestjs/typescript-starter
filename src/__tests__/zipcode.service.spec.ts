import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZipcodeDto } from 'src/zipcode.dto';
import { ZipcodeService } from '../zipcode.service';

describe('ZipcodeService', () => {
  let service: ZipcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZipcodeService],
    }).compile();

    service = module.get<ZipcodeService>(ZipcodeService);
  });

  describe('getZipcode', () => {
    it('should return the zipcode when it exists', () => {
      // Arrange
      const zipcodeId = '12345';
      const expectedZipcode: ZipcodeDto = {
        zipcode: '12345',
        city: 'Sample City',
        state: 'Sample State',
        stateAbbreviation: 'SS',
        county: 'Sample County',
        latitude: 12.345,
        longitude: 67.890,
      };
      service['zipsData'] = {
        [zipcodeId]: expectedZipcode,
      };

      const result = service.getZipcode(zipcodeId);

      expect(result).toEqual(expectedZipcode);
    });

    it('should throw NotFoundException when the zipcode does not exist', () => {
      const zipcodeId = '12345';
      service['zipsData'] = {};

      expect(() => service.getZipcode(zipcodeId)).toThrowError(NotFoundException);
    });
  });
});