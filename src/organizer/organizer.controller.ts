import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { OrganizerService } from './organizer.service';
import { Organizer } from '@prisma/client';

@ApiTags('organizers')
@Controller('organizers')
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) { }

  @Post()
  @ApiOperation({ summary: 'Create organizer' })
  @ApiResponse({
    status: 201,
    description: 'The organizer has been successfully created.',
  })
  create(@Body() organizerData: Partial<Organizer>) {
    return this.organizerService.create(organizerData);
  }

  @Get()
  @ApiOperation({ summary: 'Find all organizers' })
  @ApiResponse({
    status: 200,
    description: 'Returns all organizers.',
  })
  findAll() {
    return this.organizerService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one organizer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the organizer with the given ID.',
  })
  findOne(@Param('id') id: string) {
    return this.organizerService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an organizer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The organizer was updated successfully.',
  })
  update(@Param('id') id: string, @Body() organizerData: Partial<Organizer>) {
    return this.organizerService.update(id, organizerData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an organizer by ID' })
  @ApiResponse({
    status: 204,
    description: 'The organizer was deleted successfully.',
  })
  remove(@Param('id') id: string) {
    return this.organizerService.delete(id);
  }
}
