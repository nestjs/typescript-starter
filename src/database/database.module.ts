import { Logger, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Connection } from 'typeorm'

@Module({
  imports: [TypeOrmModule.forRoot()],
  exports: [TypeOrmModule],
})
export class DatabaseModule {
  logger = new Logger('Database')

  constructor(connection: Connection) {
    if (connection.isConnected)
      this.logger.log(`💾 Database connected successfully`)
  }
}
