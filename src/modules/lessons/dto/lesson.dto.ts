import {
  FilterableField,
  FilterableOffsetConnection,
} from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'
import { ContentDTO } from 'src/modules/contents/dto/content.dto'

@ObjectType('Lesson')
@FilterableOffsetConnection('contents', () => ContentDTO, { nullable: true })
export class LessonDTO extends CommonDTO {
  @FilterableField()
  description: string
}
