import { Column, Entity } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'

@Entity({ name: 'students' })
export class Student extends CommonEntity {
  @Column()
  name: string

  @Column()
  key: string
}
