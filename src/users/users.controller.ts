import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
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
  async getUserById(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.user(+id);
  }

  // Endpoint for deleting a user
  @Delete(':id')
  async removeUserById(@Param('id') id: string) {
    return await this.usersService.deleteUser(+id);
  }
}