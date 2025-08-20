import { AppService } from './app.service';
import { CatDto } from './create-cat.dto';
import {
  Body,
  Controller,
  Get,
  // HttpCode,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('cats')
@Controller('cats')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all cats' })
  @ApiResponse({
    status: 200,
    description: 'List of all cats retrieved successfully',
    type: [CatDto],
  })
  getAllCats(): CatDto[] {
    return this.appService.getAllCats();
  }

  @Get('getById/:id')
  @ApiOperation({ summary: 'Get a cat by ID' })
  @ApiParam({ name: 'id', description: 'Cat ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Cat retrieved successfully',
    type: CatDto,
  })
  findOne(@Param('id') id: number): CatDto {
    return this.appService.getCatById(id);
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new cat' })
  @ApiBody({ type: CatDto })
  @ApiResponse({
    status: 201,
    description: 'Cat created successfully',
    type: CatDto,
  })
  createCat(@Body() createCatDto: CatDto): CatDto {
    return this.appService.createCat(createCatDto);
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filter cats by age and breed' })
  @ApiQuery({ name: 'age', description: 'Cat age', type: 'number' })
  @ApiQuery({ name: 'breed', description: 'Cat breed status', type: 'boolean' })
  @ApiResponse({
    status: 200,
    description: 'Filtered cats retrieved successfully',
    type: [CatDto],
  })
  getFilterCats(
    @Query('age', ParseIntPipe) age: number,
    @Query('breed', ParseBoolPipe) breed: boolean,
  ): CatDto[] {
    return this.appService.filterCats(age, breed);
  }
}
