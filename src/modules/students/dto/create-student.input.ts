import { InputType } from '@nestjs/graphql'

@InputType()
export class CreateStudentInput {
  name: string
  key: string
}
