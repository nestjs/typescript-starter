import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComboController } from './combo.controller';
import { ComboService } from './combo.service';
import { Combo } from './entities/combo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Combo])],
  controllers: [ComboController],
  providers: [ComboService],
  exports: [ComboService],
})
export class ComboModule {}
