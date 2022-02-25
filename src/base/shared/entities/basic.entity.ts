import { BaseEntity, PrimaryGeneratedColumn } from 'typeorm'
import { v4 as uuid } from 'uuid'

export class BasicEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id?: string

  constructor() {
    super()
    if (!this.id) this.id = uuid()
  }
}
