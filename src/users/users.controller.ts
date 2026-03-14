import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Event } from '../events/entities/event.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/events/merge-all')
  mergeAll(@Param('id', ParseIntPipe) id: number): Promise<Event[]> {
    return this.usersService.mergeAll(id);
  }
}
