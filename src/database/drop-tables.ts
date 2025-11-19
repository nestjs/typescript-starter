import { DataSource } from 'typeorm';
import { Client } from '../client/entities/client.entity';
import { Raffle } from '../raffle/entities/raffle.entity';
import { RaffleNumbers } from '../raffle-numbers/entities/raffle-numbers.entity';
import { RaffleNumbersStatus } from '../raffle-numbers-status/entities/raffle-numbers-status.entity';

async function dropTables(): Promise<void> {
    const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'raffles',
        entities: [Client, Raffle, RaffleNumbers, RaffleNumbersStatus],
        synchronize: false,
        logging: true,
    });

    try {
        await dataSource.initialize();
        console.log('📦 Database connection established\n');

        const queryRunner = dataSource.createQueryRunner();

        // Drop tables in correct order (respecting foreign keys)
        console.log('🗑️  Dropping tables...\n');

        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

        await queryRunner.query('DROP TABLE IF EXISTS `client_raffle`;');
        console.log('✓ Dropped client_raffle');

        await queryRunner.query('DROP TABLE IF EXISTS `raffle_numbers`;');
        console.log('✓ Dropped raffle_numbers');

        await queryRunner.query('DROP TABLE IF EXISTS `raffle`;');
        console.log('✓ Dropped raffle');

        await queryRunner.query('DROP TABLE IF EXISTS `client`;');
        console.log('✓ Dropped client');

        await queryRunner.query('DROP TABLE IF EXISTS `raffle_numbers_status`;');
        console.log('✓ Dropped raffle_numbers_status');

        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');

        await queryRunner.release();
        await dataSource.destroy();

        console.log('\n✅ All tables dropped successfully!');
        console.log('💡 Now restart your app to recreate tables with correct column names.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to drop tables:', error);
        await dataSource.destroy();
        process.exit(1);
    }
}

void dropTables();

