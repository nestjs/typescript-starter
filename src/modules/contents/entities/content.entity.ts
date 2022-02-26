import { Column, Entity, ManyToOne } from 'typeorm'

import { CommonEntity } from 'src/base/shared/entities/common.entity'
import { Lesson } from 'src/modules/lessons/entities/lesson.entity'

@Entity()
export class Content extends CommonEntity {
  @Column()
  description: string

  @Column({ nullable: true })
  linkContent: string

  @ManyToOne(() => Lesson)
  lesson: Lesson
}
