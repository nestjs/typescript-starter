import {
  FilterableField,
  FilterableOffsetConnection,
} from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'
import { DisciplineDTO } from 'src/modules/disciplines/dto/discipline.dto'

@ObjectType('Student') // renomeia para o graphql, aparece como Student no playground
@FilterableOffsetConnection('disciplines', () => DisciplineDTO, {
  nullable: true,
})
export class StudentDTO extends CommonDTO {
  @FilterableField()
  name: string

  @FilterableField()
  key: string
}
