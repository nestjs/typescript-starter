import { Injectable } from '@nestjs/common';
import { PrismaClient, Organizer } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class OrganizerService {
  private prisma: PrismaClient;
  private encryptionKey: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.encryptionKey = process.env.ENCRYPTION_KEY || '';
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private encryptCnpj(cnpj: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(cnpj, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  async create(data: Partial<Organizer>): Promise<Organizer> {
    const hashedPassword = await this.hashPassword(data.password);

    return this.prisma.organizer.create({
      data: {
        name: data.name,
        email: data.email,
        cnpj: data.cnpj,
        password: hashedPassword,
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
