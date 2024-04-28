import { BadRequestException } from '@nestjs/common';
import { ZipcodePipe } from '../zipcode.pipe';

describe('ZipcodePipe', () => {
  let pipe: ZipcodePipe;

  beforeEach(() => {
    pipe = new ZipcodePipe();
  });

  describe('transform', () => {
    it('should return the input value if it is a valid zipcode', () => {
      const validZipcode = '12345';

      const result = pipe.transform(validZipcode);

      expect(result).toEqual(validZipcode);
    });

    it('should throw BadRequestException if the input value is not a valid zipcode', () => {
      const invalidZipcode = '1234';

      expect(() => pipe.transform(invalidZipcode)).toThrowError(
        BadRequestException,
      );
    });
  });

  describe('isValidZipcode', () => {
    it('should return true if the input is a valid 5-digit numeric zipcode', () => {
      const validZipcode = '12345';

      const result = pipe['isValidZipcode'](validZipcode);

      expect(result).toBe(true);
    });

    it('should return false if the input is not a valid 5-digit numeric zipcode', () => {
      const invalidZipcode = '1234';

      const result = pipe['isValidZipcode'](invalidZipcode);

      expect(result).toBe(false);
    });

    it('should return false if the input is a alphanumeric string', () => {
      const invalidZipcode = '1234a';

      const result = pipe['isValidZipcode'](invalidZipcode);

      expect(result).toBe(false);
    });
  });
});
