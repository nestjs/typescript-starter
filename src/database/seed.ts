import { DataSource } from 'typeorm';
import { DatabaseSeeder } from './database.seeder';
import { Client } from '../client/entities/client.entity';
import { Raffle } from '../raffle/entities/raffle.entity';
import { RaffleNumbers } from '../raffle-numbers/entities/raffle-numbers.entity';
import { RaffleNumbersStatus } from '../raffle-numbers-status/entities/raffle-numbers-status.entity';

async function bootstrap(): Promise<void> {
  const dataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'raffles',
    entities: [Client, Raffle, RaffleNumbers, RaffleNumbersStatus],
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('📦 Database connection established\n');

    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();

    await dataSource.destroy();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

void bootstrap();
