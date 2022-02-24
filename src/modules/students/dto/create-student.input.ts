import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class CreateStudentInput {
  @Field()
  name: string

  @Field()
  key: string
}
