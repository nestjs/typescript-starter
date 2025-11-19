import { DataSource } from 'typeorm';
import { Seeder } from '../seeder.interface';
import { Client } from '../../client/entities/client.entity';

export class ClientSeeder implements Seeder {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Client);

    const clients = [
      { name: 'John Doe', phone: '+1234567890', isActive: true },
      { name: 'Jane Smith', phone: '+0987654321', isActive: true },
      { name: 'Bob Johnson', phone: '+1122334455', isActive: true },
    ];

    for (const clientData of clients) {
      const existingClient = await repository.findOne({
        where: { phone: clientData.phone },
      });

      if (!existingClient) {
        const newClient = repository.create(clientData);
        await repository.save(newClient);
        console.log(`✓ Created client: ${clientData.name}`);
      } else {
        console.log(`- Client already exists: ${clientData.name}`);
      }
    }
  }
}
