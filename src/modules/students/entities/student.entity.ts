import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Student {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
