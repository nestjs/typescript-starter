import { InputType } from '@nestjs/graphql'

// import { UpdateLessonInput } from 'src/modules/lessons/dto/update-lesson.input'

@InputType()
export class CreateContentInput {
  description: string
  linkContent?: string

  // @Field(() => UpdateLessonInput, { nullable: true })
  // lesson?: UpdateLessonInput
  lessonId?: string
}
