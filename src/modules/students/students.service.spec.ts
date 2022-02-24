import { Test, TestingModule } from '@nestjs/testing'

import { StudentsService } from './students.service'

describe('StudentsService', () => {
  let service: StudentsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StudentsService],
    }).compile()

    service = module.get<StudentsService>(StudentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
