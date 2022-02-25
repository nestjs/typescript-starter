import { FilterableField } from '@nestjs-query/query-graphql'
import { InputType } from '@nestjs/graphql'

@InputType()
export class CreateDisciplineInput {
  @FilterableField()
  name: string
}
