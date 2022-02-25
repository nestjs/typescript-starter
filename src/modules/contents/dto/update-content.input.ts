import { InputType, PartialType } from '@nestjs/graphql'

import { CreateContentInput } from './create-content.input'

@InputType()
export class UpdateContentInput extends PartialType(CreateContentInput) {}
