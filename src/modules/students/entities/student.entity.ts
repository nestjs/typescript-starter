import { Column, Entity, ManyToMany } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'
import { Discipline } from 'src/modules/disciplines/entities/discipline.entity'

@Entity({ name: 'students' })
export class Student extends CommonEntity {
  @Column()
  name: string

  @Column()
  key: string

  @ManyToMany(() => Discipline, (disciplines) => disciplines.students, {
    nullable: true,
  })
  disciplines: Discipline[]
}
