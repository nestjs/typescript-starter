import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const organizer = await this.prisma.organizer.findUnique({
      where: { email },
    });

    if (organizer && organizer.password === password) {
      return { ...organizer, type: 'organizer' };
    }

    const volunteer = await this.prisma.volunteer.findUnique({
      where: { email },
    });

    if (volunteer && volunteer.password === password) {
      return { ...volunteer, type: 'volunteer' };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
