import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procediment } from './entities/procediment.entity';
import { ProcedimentController } from './procediment.controller';
import { ProcedimentService } from './procediment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Procediment])],
  controllers: [ProcedimentController],
  providers: [ProcedimentService],
  exports: [ProcedimentService],
})
export class ProcedimentModule {}
