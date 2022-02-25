import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'

@ObjectType('Discipline')
export class DisciplineDTO extends CommonDTO {
  @FilterableField()
  name: string
}
