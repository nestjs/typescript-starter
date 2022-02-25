import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { BasicDTO } from './basic.dto'

@ObjectType()
export class CommonDTO extends BasicDTO {
  @FilterableField()
  createdAt: Date

  @FilterableField()
  updatedAt: Date
}
