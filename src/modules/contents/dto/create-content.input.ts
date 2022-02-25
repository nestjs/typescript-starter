import { InputType } from '@nestjs/graphql'

@InputType()
export class CreateContentInput {
  description: string
  link?: string
}
