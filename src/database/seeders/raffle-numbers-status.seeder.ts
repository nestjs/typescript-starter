import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { RaffleNumbersStatus } from '../../raffle-numbers-status/entities/raffle-numbers-status.entity';

export class RaffleNumbersStatusSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(RaffleNumbersStatus);

    const statuses = ['available', 'reserved', 'sold', 'cancelled'];

    for (const status of statuses) {
      const existingStatus = await repository.findOne({
        where: { status },
      });

      if (!existingStatus) {
        const newStatus = repository.create({ status });
        await repository.save(newStatus);
        console.log(`✓ Created status: ${status}`);
      } else {
        console.log(`- Status already exists: ${status}`);
      }
    }
  }
}
