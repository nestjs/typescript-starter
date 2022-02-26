import { Column, Entity, JoinTable, ManyToMany } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'
import { Student } from 'src/modules/students/entities/student.entity'

@Entity()
export class Discipline extends CommonEntity {
  @Column()
  name: string

  @ManyToMany(() => Student, (students) => students.disciplines, {
    nullable: true,
  })
  @JoinTable()
  students: Student[]
}
