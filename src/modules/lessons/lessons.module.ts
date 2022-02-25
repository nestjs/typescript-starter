import {
  NestjsQueryGraphQLModule,
  PagingStrategies,
} from '@nestjs-query/query-graphql'
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm'
import { Module } from '@nestjs/common'

import { CreateLessonInput } from './dto/create-lesson.input'
import { LessonDTO } from './dto/lesson.dto'
import { UpdateLessonInput } from './dto/update-lesson.input'
import { Lesson } from './entities/lesson.entity'

@Module({
  imports: [
    // https://doug-martin.github.io/nestjs-query/docs/introduction/example
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([Lesson])],
      resolvers: [
        {
          DTOClass: LessonDTO,
          EntityClass: Lesson,
          CreateDTOClass: CreateLessonInput,
          UpdateDTOClass: UpdateLessonInput,
          enableTotalCount: true,
          pagingStrategy: PagingStrategies.OFFSET,
        },
      ],
    }),
  ],
  providers: [],
})
export class LessonsModule {}
