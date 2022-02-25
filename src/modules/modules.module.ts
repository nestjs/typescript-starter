import { Module } from '@nestjs/common'

import { StudentsModule } from './students/students.module'
import { DisciplinesModule } from './disciplines/disciplines.module';

@Module({
  imports: [StudentsModule, DisciplinesModule],
})
export class ModulesModule {}
