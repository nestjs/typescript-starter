import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './user.entity';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async seed() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.usersRepository.findOne({
        where: { isAdmin: true },
      });

      if (existingAdmin) {
        this.logger.log('Admin user already exists, skipping seed');
        return;
      }

      // Get admin user configuration from environment variables
      const adminName = this.configService.get<string>(
        'ADMIN_NAME',
        'Admin User',
      );
      const adminEmail = this.configService.get<string>(
        'ADMIN_EMAIL',
        'admin@example.com',
      );

      // Create default admin user
      const adminUser = this.usersRepository.create({
        name: adminName,
        email: adminEmail,
        isAdmin: true,
      });

      await this.usersRepository.save(adminUser);
      this.logger.log(
        `Admin user '${adminName}' created successfully with email '${adminEmail}'`,
      );
    } catch (error) {
      this.logger.error('Failed to seed admin user:', error);
    }
  }
}
