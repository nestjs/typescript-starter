import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { CreateUserDto } from '../events/dto/create-event.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Endpoint for creating a new user
  @Post()
  async createUser(@Body() createUserData: CreateUserDto): Promise<User> {
    return await this.usersService.createUser(createUserData);
  }

  // Endpoint for creating a new user
  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User | null> {
    return this.usersService.user(+id);
  }
}