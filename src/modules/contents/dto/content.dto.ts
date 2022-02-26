import {
  FilterableField,
  FilterableRelation,
} from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'
import { LessonDTO } from 'src/modules/lessons/dto/lesson.dto'

@ObjectType('Content')
@FilterableRelation('lesson', () => LessonDTO)
export class ContentDTO extends CommonDTO {
  @FilterableField()
  description: string

  @FilterableField({ nullable: true })
  linkContent: string
}
