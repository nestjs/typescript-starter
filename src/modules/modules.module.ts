import { Module } from '@nestjs/common'

import { StudentsModule } from './students/students.module'

@Module({
  imports: [StudentsModule],
})
export class ModulesModule {}
