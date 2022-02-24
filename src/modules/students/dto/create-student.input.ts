import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateStudentInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}
