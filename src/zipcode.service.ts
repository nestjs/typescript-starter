import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as fs from 'fs';
import { ZipcodeDto } from './zipcode.dto';

@Injectable()
/**
 * Service class for managing zipcodes.
 */
export class ZipcodeService implements OnModuleInit {
  private zipsData: Record<string, ZipcodeDto>;
  private logger: Logger; // Add the logger property

  constructor() {
    this.logger = new Logger(ZipcodeService.name);
  }

  /**
   * This method is automatically called when the module is initialized. It also
   * will only be called once so it is a good place to load data that will be
   * used throughout the lifecycle of the application like our zip code data.
   */
  onModuleInit() {
    this.loadZipsData();
  }

  /**
   * Loads the zip code data from a CSV file and stores it in a map.
   * The map uses the zip code as the key and the corresponding ZipcodeDto as the value.
   *
   * @remarks
   * Storing the zip code data in a map allows for efficient lookup and retrieval of
   * zip code information based on the zip code itself using constant time complexity
   *
   * @private
   */
  private loadZipsData() {
    const startTime = new Date().getTime(); // Get the start time

    // Not using any particular csv parsing library for simplicity and because
    // our csv data is simple enough to parse manually.
    const csvData = fs.readFileSync('./resources/zips.csv', 'utf-8');
    const rows = csvData.split('\n');
    const zipcodes: Record<string, ZipcodeDto> = {};

    rows.forEach((row) => {
      const columns = row.split(',');
      const input: ZipcodeDto = {
        zipcode: columns[0],
        city: columns[1],
        state: columns[2],
        stateAbbreviation: columns[3],
        county: columns[4],
        latitude: parseFloat(columns[5]),
        longitude: parseFloat(columns[6]),
      };
      zipcodes[input.zipcode] = input;
    });

    this.zipsData = zipcodes;

    const endTime = new Date().getTime(); // Get the end time
    const executionTime = `${endTime - startTime}ms`; // Calculate the execution time

    this.logger.log({ executionTime }, 'Zip data loaded');
  }

  /**
   * Retrieves the details of a zipcode based on the provided id.
   * @param id - The id of the zipcode to retrieve.
   * @returns The details of the zipcode.
   * @throws NotFoundException if the zipcode is not found.
   */
  getZipcode(id: string): ZipcodeDto {
    this.logger.log({ zipcode: id }, `Getting zipcode details for ${id}`);
    const zipcode = this.zipsData[id];
    if (!zipcode) {
      throw new NotFoundException('Zipcode not found');
    }
    return zipcode;
  }
}
