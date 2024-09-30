import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class TrackController {
  create() {
    return 'Track created successfully!';
  }

  @Get()
  getAll() {
    return 'All tracks retrieved successfully!';
  }

  getOne() {
    return 'Track retrieved successfully!';
  }

  delete() {
    return 'Track deleted successfully!';
  }
}
