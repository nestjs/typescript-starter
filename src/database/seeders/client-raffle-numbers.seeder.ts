import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { Client } from '../../client/entities/client.entity';
import { RaffleNumbers } from '../../raffle-numbers/entities/raffle-numbers.entity';
import { Raffle } from '../../raffle/entities/raffle.entity';
import { RaffleNumbersStatus } from '../../raffle-numbers-status/entities/raffle-numbers-status.entity';

export class ClientRaffleNumbersSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const clientRepository = this.dataSource.getRepository(Client);
    const raffleNumbersRepository =
      this.dataSource.getRepository(RaffleNumbers);
    const raffleRepository = this.dataSource.getRepository(Raffle);
    const statusRepository = this.dataSource.getRepository(RaffleNumbersStatus);

    const clients = await clientRepository.find();
    const raffles = await raffleRepository.find();
    const reservedStatus = await statusRepository.findOne({
      where: { status: 'reserved' },
    });
    const soldStatus = await statusRepository.findOne({
      where: { status: 'sold' },
    });

    if (clients.length === 0 || raffles.length === 0) {
      console.log(
        '- Skipping client-raffle-numbers: clients or raffles not found',
      );
      return;
    }

    if (!reservedStatus || !soldStatus) {
      console.log(
        '- Skipping client-raffle-numbers: statuses not found. Run RaffleNumbersStatusSeeder first.',
      );
      return;
    }

    // Assign numbers to first client from first raffle
    if (clients[0] && raffles[0]) {
      const availableNumbers = await raffleNumbersRepository.find({
        where: {
          raffle: { id: raffles[0].id },
          client: null,
        },
        take: 5, // Assign 5 numbers to first client
      });

      if (availableNumbers.length > 0) {
        for (let i = 0; i < Math.min(3, availableNumbers.length); i++) {
          availableNumbers[i].client = clients[0];
          availableNumbers[i].raffleNumbersStatus = reservedStatus;
          await raffleNumbersRepository.save(availableNumbers[i]);
        }
        console.log(
          `✓ Assigned ${Math.min(3, availableNumbers.length)} numbers to client "${clients[0].name}" from raffle "${raffles[0].name}"`,
        );
      }
    }

    // Assign numbers to second client from first raffle
    if (clients[1] && raffles[0]) {
      const availableNumbers = await raffleNumbersRepository.find({
        where: {
          raffle: { id: raffles[0].id },
          client: null,
        },
        take: 3,
      });

      if (availableNumbers.length > 0) {
        for (let i = 0; i < Math.min(2, availableNumbers.length); i++) {
          availableNumbers[i].client = clients[1];
          availableNumbers[i].raffleNumbersStatus = soldStatus;
          await raffleNumbersRepository.save(availableNumbers[i]);
        }
        console.log(
          `✓ Assigned ${Math.min(2, availableNumbers.length)} numbers to client "${clients[1].name}" from raffle "${raffles[0].name}"`,
        );
      }
    }

    // Assign numbers to first client from second raffle (if exists)
    if (clients[0] && raffles[1]) {
      const availableNumbers = await raffleNumbersRepository.find({
        where: {
          raffle: { id: raffles[1].id },
          client: null,
        },
        take: 4,
      });

      if (availableNumbers.length > 0) {
        for (let i = 0; i < Math.min(4, availableNumbers.length); i++) {
          availableNumbers[i].client = clients[0];
          availableNumbers[i].raffleNumbersStatus = reservedStatus;
          await raffleNumbersRepository.save(availableNumbers[i]);
        }
        console.log(
          `✓ Assigned ${Math.min(4, availableNumbers.length)} numbers to client "${clients[0].name}" from raffle "${raffles[1].name}"`,
        );
      }
    }
  }
}
