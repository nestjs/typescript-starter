import { DeleteDateColumn } from 'typeorm'

import { CommonEntity } from './common.entity'

export class SoftEntity extends CommonEntity {
  @DeleteDateColumn()
  deletedAt: Date
}
