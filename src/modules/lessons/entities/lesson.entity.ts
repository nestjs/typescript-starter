import { Column, Entity, OneToMany } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'
import { Content } from 'src/modules/contents/entities/content.entity'

@Entity()
export class Lesson extends CommonEntity {
  @Column()
  description: string

  @OneToMany(() => Content, (contents) => contents.lesson)
  contents: Content[]
}
