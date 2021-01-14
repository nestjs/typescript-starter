import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() { }

  @Get()
  getHello(): object {
    return {
      status: 'ok'
    };
  }
  @Get('/health-check')
  healthCheck() {
    return {
      status: 'ok'
    }
  }
}
