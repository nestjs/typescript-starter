import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        super({
            datasources: {
                db: {
                    url: 'postgresql://bleach5406:bleach54276@localhost:5432/ralab_db?schema=public'
                }
            }
        });
    }
}
