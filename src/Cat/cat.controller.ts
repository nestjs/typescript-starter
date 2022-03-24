import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpException,
  HttpStatus,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/helper/exception.filter';
import { ValidationPipe } from 'src/helper/validationPipe';
import { CatsService } from './cat.service';
import { CreateCatDto } from './dto';
import { Cat } from './interface';
import { CreateCatSchema } from './schema';

@Controller()
@UseFilters(HttpExceptionFilter)
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  @UsePipes(new ValidationPipe(CreateCatSchema))
  @HttpCode(204)
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<Cat[]> {
    throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);

    // return this.catsService.findAll();
  }
}
