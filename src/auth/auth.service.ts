import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async validateUser(email: string, password: string): Promise<any> {
    const organizer = await this.prisma.organizer.findUnique({
      where: { email },
    });

    if (organizer && (await bcrypt.compare(password, organizer.password))) {
      return { ...organizer, type: 'organizer' };
    }

    const volunteer = await this.prisma.volunteer.findUnique({
      where: { email },
    });

    if (volunteer && (await bcrypt.compare(password, volunteer.password))) {
      return { ...volunteer, type: 'volunteer' };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
