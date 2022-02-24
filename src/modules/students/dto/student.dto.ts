import { FilterableField } from '@nestjs-query/query-graphql'
import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType('Student') // renomeia para o graphql, aparece como Student no playground
export class StudentDTO {
  @Field()
  id: string

  @FilterableField()
  name: string

  @FilterableField()
  key: string
}
