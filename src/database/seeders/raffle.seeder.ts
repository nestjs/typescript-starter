import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { Raffle } from '../../raffle/entities/raffle.entity';

export class RaffleSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Raffle);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const raffles = [
      {
        name: 'Summer Raffle 2024',
        quantity: 100,
        price: 10.0,
        prize: 'iPhone 15 Pro',
        startDate,
        lottery: 'LOT-001',
        endDate,
      },
      {
        name: 'Holiday Special',
        quantity: 50,
        price: 25.0,
        prize: 'MacBook Pro',
        startDate,
        lottery: 'LOT-002',
        endDate,
      },
    ];

    for (const raffleData of raffles) {
      const existingRaffle = await repository.findOne({
        where: { lottery: raffleData.lottery },
      });

      if (!existingRaffle) {
        const newRaffle = repository.create(raffleData);
        await repository.save(newRaffle);
        console.log(`✓ Created raffle: ${raffleData.name}`);
      } else {
        console.log(`- Raffle already exists: ${raffleData.name}`);
      }
    }
  }
}
