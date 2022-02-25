import { InputType } from '@nestjs/graphql'

@InputType()
export class CreateLessonInput {
  description: string
}
