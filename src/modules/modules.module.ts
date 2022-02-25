import { Module } from '@nestjs/common'

import { ContentsModule } from './contents/contents.module'
import { DisciplinesModule } from './disciplines/disciplines.module'
import { LessonsModule } from './lessons/lessons.module'
import { StudentsModule } from './students/students.module'

@Module({
  imports: [ContentsModule, DisciplinesModule, LessonsModule, StudentsModule],
})
export class ModulesModule {}
