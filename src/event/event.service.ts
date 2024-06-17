import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaClient, Event } from '@prisma/client';

export interface CreateEventDto {
  location: string;
  title: string;
  description?: string;
  organizerId: string;
  date: Date; // Tipo Date para representar a data do evento
  volunteerId: string;
}

@Injectable()
export class EventService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreateEventDto): Promise<Event> {
    if (!data.location || !data.title || !data.organizerId) {
      throw new BadRequestException('Missing required fields');
    }
    return this.prisma.event.create({
      data: {
        location: data.location,
        title: data.title,
        description: data.description || null,
        organizerId: data.organizerId,
        date: data.date,
        volunteerId: data.volunteerId,
      },
    });
  }

  async findAll(): Promise<Event[]> {
    return this.prisma.event.findMany();
  }

  async findOne(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<Event>): Promise<Event> {
    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Event> {
    return this.prisma.event.delete({ where: { id } });
  }
}
