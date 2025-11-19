import { DataSource } from 'typeorm';
import { RaffleNumbersStatusSeeder } from './seeders/raffle-numbers-status.seeder';
import { ClientSeeder } from './seeders/client.seeder';
import { RaffleSeeder } from './seeders/raffle.seeder';
import { ClientRaffleSeeder } from './seeders/client-raffle.seeder';
import { RaffleNumbersSeeder } from './seeders/raffle-numbers.seeder';
import { ClientRaffleNumbersSeeder } from './seeders/client-raffle-numbers.seeder';

export class DatabaseSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting database seeding...\n');

    try {
      // Run seeders in order (respecting dependencies)
      await new RaffleNumbersStatusSeeder(this.dataSource).run();
      console.log('');

      await new ClientSeeder(this.dataSource).run();
      console.log('');

      await new RaffleSeeder(this.dataSource).run();
      console.log('');

      await new ClientRaffleSeeder(this.dataSource).run();
      console.log('');

      await new RaffleNumbersSeeder(this.dataSource).run();
      console.log('');

      await new ClientRaffleNumbersSeeder(this.dataSource).run();
      console.log('');

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }
}
