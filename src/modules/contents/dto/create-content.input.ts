import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateContentInput {
  @Field(() => String, { nullable: true })
  description: string

  @Field(() => String, { nullable: true })
  link?: string
}
