import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ZipcodePipe implements PipeTransform {
    transform(value: any): number {
        if (!this.isValidZipcode(value)) {
            throw new BadRequestException('Invalid US zipcode');
        }

        return value;
    }

    /**
     * Validates whether the given input is a valid zipcode (5 digit numeric)
     * Note that we are intentionally not matching on the 9-digit extended
     * format because CSV data only contains the 5-digit format.
     *
     * @type {RegExp}
     */
    private isValidZipcode(input: string): boolean {
        const zipcodeRegex = /^\d{5}$/;
        return zipcodeRegex.test(input);
    }
}