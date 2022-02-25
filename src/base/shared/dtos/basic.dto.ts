import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

@ObjectType()
export class BasicDTO {
  @FilterableField()
  id: string
}
