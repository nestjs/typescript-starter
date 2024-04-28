import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import { ZipcodeDto } from './zipcode.dto';

@Injectable()
/**
 * Service class for managing zipcodes.
 */
export class ZipcodeService implements OnModuleInit {
  private zipsData: Record<string, ZipcodeDto>;

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
    console.log('loading zip data');
    const startTime = new Date().getTime(); // Get the start time

    // Not using any particular csv parsing library for simplicity and because
    // our csv data is simple enough to parse manually.
    const csvData = fs.readFileSync('./resources/zips.csv', 'utf-8');
    const rows = csvData.split('\n');
    const zipcodes: Record<string, ZipcodeDto> = {};

    rows.forEach(row => {
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

    // TODO: Replace with a logger
    console.log(JSON.stringify({
      executionTime,
      message: 'Zip data loaded',
    }));
  }

  getZipcode(id: string): ZipcodeDto {
    // TODO: Replace with a logger
    console.log(JSON.stringify({message: `Getting zipcode details for ${id}`, zipcode: id}));
    const zipcode = this.zipsData[id];
    if (!zipcode) {
      throw new NotFoundException('Zipcode not found');
    }
    return zipcode;
  }
}
