import {
  FilterableField,
  FilterableOffsetConnection,
} from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'
import { StudentDTO } from 'src/modules/students/dto/student.dto'

@ObjectType('Discipline')
@FilterableOffsetConnection('students', () => StudentDTO, {
  nullable: true,
})
export class DisciplineDTO extends CommonDTO {
  @FilterableField()
  name: string
}
