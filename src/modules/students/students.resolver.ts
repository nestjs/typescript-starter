import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql'

import { CreateStudentInput } from './dto/create-student.input'
import { UpdateStudentInput } from './dto/update-student.input'
import { Student } from './entities/student.entity'
import { StudentsService } from './students.service'

@Resolver(() => Student)
export class StudentsResolver {
  constructor(private readonly studentsService: StudentsService) {}

  @Mutation(() => Student)
  createStudent(
    @Args('createStudentInput') createStudentInput: CreateStudentInput
  ) {
    return this.studentsService.create(createStudentInput)
  }

  @Query(() => [Student], { name: 'students' })
  findAll() {
    return this.studentsService.findAll()
  }

  @Query(() => Student, { name: 'student' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.studentsService.findOne(id)
  }

  @Mutation(() => Student)
  updateStudent(
    @Args('updateStudentInput') updateStudentInput: UpdateStudentInput
  ) {
    return this.studentsService.update(
      updateStudentInput.id,
      updateStudentInput
    )
  }

  @Mutation(() => Student)
  removeStudent(@Args('id', { type: () => Int }) id: number) {
    return this.studentsService.remove(id)
  }
}
