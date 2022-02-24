import { Test, TestingModule } from '@nestjs/testing'

import { StudentsResolver } from './students.resolver'
import { StudentsService } from './students.service'

describe('StudentsResolver', () => {
  let resolver: StudentsResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsResolver, StudentsService],
    }).compile()

    resolver = module.get<StudentsResolver>(StudentsResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
