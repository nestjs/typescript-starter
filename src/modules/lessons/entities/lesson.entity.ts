import { Column, Entity } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'

@Entity()
export class Lesson extends CommonEntity {
  @Column()
  description: string
}
