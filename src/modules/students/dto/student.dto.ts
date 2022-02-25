import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'

@ObjectType('Student') // renomeia para o graphql, aparece como Student no playground
export class StudentDTO extends CommonDTO {
  @FilterableField()
  name: string

  @FilterableField()
  key: string
}
