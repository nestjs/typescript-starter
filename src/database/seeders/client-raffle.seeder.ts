import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { Client } from '../../client/entities/client.entity';
import { Raffle } from '../../raffle/entities/raffle.entity';

export class ClientRaffleSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const clientRepository = this.dataSource.getRepository(Client);
    const raffleRepository = this.dataSource.getRepository(Raffle);

    const clients = await clientRepository.find();
    const raffles = await raffleRepository.find();

    if (clients.length === 0 || raffles.length === 0) {
      console.log(
        '- Skipping client-raffle relationships: clients or raffles not found',
      );
      return;
    }

    // Associate first client with first raffle
    if (clients[0] && raffles[0]) {
      const client = await clientRepository.findOne({
        where: { id: clients[0].id },
        relations: ['raffles'],
      });

      if (client && !client.raffles.some((r) => r.id === raffles[0].id)) {
        client.raffles.push(raffles[0]);
        await clientRepository.save(client);
        console.log(
          `✓ Associated client "${client.name}" with raffle "${raffles[0].name}"`,
        );
      } else {
        console.log(
          `- Client "${clients[0].name}" already associated with raffle "${raffles[0].name}"`,
        );
      }
    }

    // Associate second client with first raffle
    if (clients[1] && raffles[0]) {
      const client = await clientRepository.findOne({
        where: { id: clients[1].id },
        relations: ['raffles'],
      });

      if (client && !client.raffles.some((r) => r.id === raffles[0].id)) {
        client.raffles.push(raffles[0]);
        await clientRepository.save(client);
        console.log(
          `✓ Associated client "${client.name}" with raffle "${raffles[0].name}"`,
        );
      } else {
        console.log(
          `- Client "${clients[1].name}" already associated with raffle "${raffles[0].name}"`,
        );
      }
    }

    // Associate first client with second raffle (if exists)
    if (clients[0] && raffles[1]) {
      const client = await clientRepository.findOne({
        where: { id: clients[0].id },
        relations: ['raffles'],
      });

      if (client && !client.raffles.some((r) => r.id === raffles[1].id)) {
        client.raffles.push(raffles[1]);
        await clientRepository.save(client);
        console.log(
          `✓ Associated client "${client.name}" with raffle "${raffles[1].name}"`,
        );
      } else {
        console.log(
          `- Client "${clients[0].name}" already associated with raffle "${raffles[1].name}"`,
        );
      }
    }
  }
}
