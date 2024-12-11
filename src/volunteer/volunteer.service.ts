import { Injectable } from '@nestjs/common';
import { PrismaClient, Volunteer } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
@Injectable()
export class VolunteerService {
  private prisma: PrismaClient;
  private encryptionKey: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default_key';
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private encryptCpf(cpf: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(cpf, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async create(data: Partial<Volunteer>): Promise<Volunteer> {
    const hashedPassword = await this.hashPassword(data.password);

    return this.prisma.volunteer.create({
      data: {
        email: data.email,
        name: data.name,
        id: data.id,
        cpf: data.cpf,
        password: hashedPassword,
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
  async associateToEvent(
    volunteerId: string,
    eventId: string,
  ): Promise<Volunteer> {
    return this.prisma.volunteer.update({
      where: { id: volunteerId },
      data: {
        eventId: eventId,
      },
    });
  }
}
