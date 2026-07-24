import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Event } from './events/event.entity';
import { User } from './users/user.entity';

// Defaults to a local sqlite file so `npm run start:dev` just works with no
// setup. Set DB_TYPE=postgres (or mysql) plus the usual DB_HOST/DB_PORT/etc
// env vars to point this at a real database instead - the assignment says
// it should be able to persist to mysql/postgres, this is what makes that
// possible without changing any code.
export function getDatabaseConfig(): TypeOrmModuleOptions {
  const entities = [Event, User];

  if (process.env.DB_TYPE === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'events_db',
      entities,
      synchronize: true, // fine for a take-home, would use migrations for real
    };
  }

  if (process.env.DB_TYPE === 'mysql') {
    return {
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? 'root',
      database: process.env.DB_NAME ?? 'events_db',
      entities,
      synchronize: true,
    };
  }

  // default: sqlite file on disk, zero config needed
  return {
    type: 'better-sqlite3',
    database: process.env.DB_NAME ?? 'events.sqlite',
    entities,
    synchronize: true,
  };
}
