import { Controller, Get, HttpException, HttpStatus, Param } from '@nestjs/common';

import { PostcodeService } from './postcode.service';

@Controller('postcode')
export class PostcodeController {
  constructor(private readonly postcodeService: PostcodeService) { }

  @Get(":postcode")
  async getPostcode(@Param("postcode") postcode: string): Promise<[number, number]> {

    let { status, data } = await this.postcodeService.getPostcodeLatLong(postcode)

    if (status === 404) {
      throw new HttpException("Invalid Postcode", HttpStatus.NOT_FOUND)
    } else if (status !== 200) {
      throw new HttpException("Bad Request", HttpStatus.BAD_REQUEST)
    }

    return data;
  }
}