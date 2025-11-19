import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { RaffleNumbers } from '../../raffle-numbers/entities/raffle-numbers.entity';
import { Raffle } from '../../raffle/entities/raffle.entity';
import { RaffleNumbersStatus } from '../../raffle-numbers-status/entities/raffle-numbers-status.entity';

export class RaffleNumbersSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const raffleNumbersRepository =
      this.dataSource.getRepository(RaffleNumbers);
    const raffleRepository = this.dataSource.getRepository(Raffle);
    const statusRepository = this.dataSource.getRepository(RaffleNumbersStatus);

    const raffles = await raffleRepository.find();
    const availableStatus = await statusRepository.findOne({
      where: { status: 'available' },
    });

    if (raffles.length === 0) {
      console.log('- Skipping raffle numbers: no raffles found');
      return;
    }

    if (!availableStatus) {
      console.log(
        '- Skipping raffle numbers: "available" status not found. Run RaffleNumbersStatusSeeder first.',
      );
      return;
    }

    for (const raffle of raffles) {
      // Create numbers from 1 to quantity for each raffle
      const existingNumbers = await raffleNumbersRepository.find({
        where: { raffle: { id: raffle.id } },
      });

      if (existingNumbers.length >= raffle.quantity) {
        console.log(
          `- Raffle "${raffle.name}" already has ${existingNumbers.length} numbers`,
        );
        continue;
      }

      const numbersToCreate: number[] = [];
      for (let i = 1; i <= raffle.quantity; i++) {
        const exists = existingNumbers.some((n) => n.number === i);
        if (!exists) {
          numbersToCreate.push(i);
        }
      }

      for (const number of numbersToCreate) {
        const raffleNumber = raffleNumbersRepository.create({
          number,
          raffle,
          raffleNumbersStatus: availableStatus,
        });
        await raffleNumbersRepository.save(raffleNumber);
      }

      console.log(
        `✓ Created ${numbersToCreate.length} numbers for raffle "${raffle.name}"`,
      );
    }
  }
}
