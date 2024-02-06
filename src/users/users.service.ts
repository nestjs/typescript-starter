import { Injectable, NotFoundException, BadRequestException, ForbiddenException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { CreateUserDto } from '../events/dto/create-event.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
    });

    if (user) { // Check if the ID of the invitee already exists
      throw new ForbiddenException(`User with ID ${data.id} already exists.`);
    } 

    // Create a new user
    const createdUser = await this.prisma.user.create({
      data: {
        id: data.id,
        name: data.name || 'Default Name',
        events: {
          create: []
        }
      }
    });

    return createdUser;
  }

  // Service for querying an user with ID
  async user(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { events: true }, 
    });

    if (!user) {
      throw new NotFoundException(`Could not find user with ID ${id}.`);
    }
    return user;
  }

  // Service for deleting an user with ID
  async deleteUser(id: number) {
    try {
      // Delete the event with the matching ID
      return await this.prisma.user.delete({ where: { id: id } });
    } 
    catch (error) {
      throw new NotFoundException(`Could not find user with ID ${id} to delete.`);
    }
  }
}