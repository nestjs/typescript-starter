import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { ConfigService } from '../config/config.service';
import { TypeormLoggerService } from './typeorm.logger.service';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(readonly config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: 'sqlite.db',
      entities: this.config.isProdEnvironment
        ? ['dist/**/**.entity{.ts,.js}']
        : ['src/**/**.entity{.ts,.js}'],
      logging: this.config.isDevEnvironment ? 'all' : ['error'],
      logger: new TypeormLoggerService(),
      maxQueryExecutionTime: 1000,
      synchronize: false,
    };
  }
}
