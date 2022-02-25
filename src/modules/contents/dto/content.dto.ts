import { FilterableField } from '@nestjs-query/query-graphql'
import { ObjectType } from '@nestjs/graphql'

import { CommonDTO } from 'src/base/shared/dtos/common.dto'

@ObjectType('Content')
export class ContentDTO extends CommonDTO {
  @FilterableField()
  description: string

  @FilterableField({ nullable: true })
  link: string
}
