import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  Request,
} from '@nestjs/common';

import { ComboService } from './combo.service';
import { CreateCombo } from './dto/create-combo.dto';
import { UpdateCombo } from './dto/update-combo.dto';

@Controller('combo')
export class ComboController {
  constructor(private readonly comboService: ComboService) {}

  @Get('/getall')
  async index() {
    return await this.comboService.findAll();
  }

  @Post('/save')
  async store(@Body() body: CreateCombo, @Request() req) {
    return await this.comboService.store(body, req.user);
  }

  @Get('/get/:id')
  async show(@Param('id', new ParseIntPipe()) id: number) {
    return await this.comboService.findOneOrFail({ where: { id } });
  }

  @Put('/put')
  async update(@Body() body: UpdateCombo) {
    return await this.comboService.update(body);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id', new ParseIntPipe()) id: number) {
    return await this.comboService.destroy(id);
  }
}
