import { Controller, Get } from '@nestjs/common';
import { UserService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userServices: UserService) {}

  @Get()
  getUser(): any {
    return this.userServices.getUser();
  }
}
