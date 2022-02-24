import { join } from 'path'

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'

import { DatabaseModule } from 'src/database/database.module'
import { ModulesModule } from 'src/modules/modules.module'

import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ModulesModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
    }),
  ],

  providers: [AppService],
})
export class AppModule {}
