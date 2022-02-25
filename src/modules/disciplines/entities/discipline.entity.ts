import { Column, Entity } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'

@Entity()
export class Discipline extends CommonEntity {
  @Column()
  name: string
}
