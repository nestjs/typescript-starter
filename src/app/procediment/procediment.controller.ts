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
  UseGuards,
} from '@nestjs/common';
import { ProcedimentService } from './procediment.service';
import { CreateProcedimentDto } from './dto/create-procediment.dto';
import { UpdateProcedimentDto } from './dto/update-procediment.dto';
import { JwtAuthGuard } from 'src/app/auth/jwt-auth.guard';

@Controller('procediment')
export class ProcedimentController {
  constructor(private readonly procedimentService: ProcedimentService) {}

  @Get('/getall')
  async index() {
    return await this.procedimentService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/save')
  async store(@Body() body: CreateProcedimentDto, @Request() req) {
    return await this.procedimentService.store(body, req.user);
  }

  @Get('/get/:id')
  async show(@Param('id', new ParseIntPipe()) id: number) {
    return await this.procedimentService.findOneOrFail({ where: { id } });
  }

  @Put('/put')
  async update(@Body() body: UpdateProcedimentDto) {
    return await this.procedimentService.update(body);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id', new ParseIntPipe()) id: number) {
    return await this.procedimentService.destroy(id);
  }
}
