import { Logger } from '@nestjs/common';
import { Logger as TypeormLogger, QueryRunner } from 'typeorm';

export class TypeormLoggerService implements TypeormLogger {
  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    Logger.log(`query: ${sql}`, 'TypeORM');
  }

  logQueryError(
    error: string,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    Logger.error(`query failed: ${sql}`, error, 'TypeORM');
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    Logger.warn(`query is slow: ${sql}`, 'TypeORM');
    Logger.warn(`execution time: ${time}`);
  }

  logSchemaBuild(_message: string, _queryRunner?: QueryRunner) {
    throw new Error('Method not implemented.');
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    Logger.log(message, 'TypeORM');
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ) {
    switch (level) {
      case 'log':
        Logger.log(message);
        break;
      case 'info':
        Logger.log(message);
        break;
      case 'warn':
        Logger.warn(message);
        break;
    }
  }

  /**
   * Converts parameters to a string.
   * Sometimes parameters can have circular objects and therefor we are handle this case too.
   */
  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters);
    } catch (error) {
      // most probably circular objects in parameters
      return parameters;
    }
  }
}
