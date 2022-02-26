import { Field, InputType, PartialType } from '@nestjs/graphql'

import { CreateLessonInput } from './create-lesson.input'

@InputType()
export class UpdateLessonInput extends PartialType(CreateLessonInput) {
  @Field(() => String, { nullable: true })
  id?: string
}
