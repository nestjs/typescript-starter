import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VolunteerService } from './volunteer.service';
import { Volunteer } from '@prisma/client';

@ApiTags('volunteers')
@Controller('volunteers')
export class VolunteerController {
  constructor(private readonly volunteerService: VolunteerService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new volunteer' })
  @ApiResponse({
    status: 201,
    description: 'The volunteer has been successfully created.',
  })
  create(@Body() volunteerData: Partial<Volunteer>) {
    return this.volunteerService.create(volunteerData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all volunteers' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of all volunteers.',
    isArray: true,
  })
  findAll() {
    return this.volunteerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a volunteer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successful retrieval of a single volunteer.',
  })
  findOne(@Param('id') id: string) {
    return this.volunteerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a volunteer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successful update of a volunteer.',
  })
  update(@Param('id') id: string, @Body() volunteerData: Partial<Volunteer>) {
    return this.volunteerService.update(id, volunteerData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a volunteer by ID' })
  @ApiResponse({
    status: 204,
    description: 'Successful deletion of a volunteer.',
  })
  remove(@Param('id') id: string) {
    return this.volunteerService.delete(id);
  }
}
