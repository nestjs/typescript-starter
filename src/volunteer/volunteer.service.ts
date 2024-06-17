import { Injectable } from '@nestjs/common';
import { PrismaClient, Volunteer } from '@prisma/client';

@Injectable()
export class VolunteerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Partial<Volunteer>): Promise<Volunteer> {
    return this.prisma.volunteer.create({
      data: {
        email: data.email,
        name: data.name,
        eventId: data.eventId,
        id: data.id,
        cpf: data.cpf,
        password: data.password,
      },
    });
  }

  async findAll(): Promise<Volunteer[]> {
    return this.prisma.volunteer.findMany();
  }

  async findOne(id: string): Promise<Volunteer | null> {
    return this.prisma.volunteer.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<Volunteer>): Promise<Volunteer> {
    return this.prisma.volunteer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Volunteer> {
    return this.prisma.volunteer.delete({ where: { id } });
  }
}
