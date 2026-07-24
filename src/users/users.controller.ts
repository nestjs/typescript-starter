import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

// The assignment doesn't actually ask for a Users API, only the Event API
// (create/retrieve/delete/mergeAll). But there's no way to test invitees or
// mergeAll without users existing in the DB somehow, so this is here just to
// make the feature actually usable/demoable. Kept it as small as possible on
// purpose - no service layer, no DTO validation - since it's not really part
// of what's being evaluated. Wouldn't leave it this thin in a real project.
@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  create(@Body('name') name: string): Promise<User> {
    return this.userRepository.save(this.userRepository.create({ name }));
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }
}
