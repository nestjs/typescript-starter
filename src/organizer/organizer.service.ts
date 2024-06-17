import { Injectable } from '@nestjs/common';
import { PrismaClient, Organizer } from '@prisma/client';

@Injectable()
export class OrganizerService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: Partial<Organizer>): Promise<Organizer> {
    return this.prisma.organizer.create({
      data: {
        name: data.name,
        email: data.email,
        cnpj: data.cnpj,
        password: data.password,
      },
    });
  }

  async findAll(): Promise<Organizer[]> {
    return this.prisma.organizer.findMany();
  }

  async findOne(id: string): Promise<Organizer | null> {
    return this.prisma.organizer.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<Organizer>): Promise<Organizer> {
    return this.prisma.organizer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Organizer> {
    return this.prisma.organizer.delete({ where: { id } });
  }
}
