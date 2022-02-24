import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

import { BasicEntity } from './basic.entity'

export class CommonEntity extends BasicEntity {
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
