import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from './common.dto'

@ObjectType()
export class SoftEntity extends CommonDTO {
  @FilterableField()
  deletedAt: Date
}
