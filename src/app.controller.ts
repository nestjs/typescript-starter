import { Controller, Get, Param, Res } from '@nestjs/common';
import { ZipcodeDto } from './zipcode.dto';
import { ZipcodePipe } from './zipcode.pipe';
import { ZipcodeService } from './zipcode.service';

@Controller()
export class AppController {
  constructor(private readonly zipcodeService: ZipcodeService) {}

  @Get('/zipcodes/:zipcode')
  async getZipcode(@Param('zipcode', new ZipcodePipe()) id, @Res() res): Promise<ZipcodeDto> {
      return res.json(await this.zipcodeService.getZipcode(id));
  }
}
