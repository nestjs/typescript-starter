import { Field, InputType, PartialType } from '@nestjs/graphql'

import { CreateContentInput } from './create-content.input'

@InputType()
export class UpdateContentInput extends PartialType(CreateContentInput) {
  @Field(() => String, { nullable: true })
  id?: string
}
