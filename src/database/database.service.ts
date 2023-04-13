/* Reference: https://github.com/mguay22/nestjs-mongo/tree/e2e-finish */

import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) { }

  getDbHandle(): Connection {
    return this.connection;
  }
}