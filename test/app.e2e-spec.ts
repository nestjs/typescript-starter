import { INestApplication, Module } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { TaskDto } from 'src/task/dto';
import { statusType } from '@prisma/client' 

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  beforeAll(async() => {
    const moduleRef = 
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication()
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    )
    
    await app.init()
    await app.listen(3333)  
    prisma = app.get(PrismaService)
    
    await prisma.cleanDb()
  })

  afterAll(() => {
    app.close()
  })
  
  describe('Task', () => {
    const dto: TaskDto = {
      title: 'test_task',
      description: 'test create task functionality',
      status: statusType.TODO,
    }
    describe('create', () => {
      
      it('should create', () => {
        return pactum
        .spec()
        .post(
          'http://localhost:3333/task/create'
        ).withBody(dto)
        .expectStatus(201)
      })
    })

    describe('retrieve', () => {
      it('should retrieve', () => {
        return pactum
          .spec()
          .get(
            'http://localhost:3333/task/1'
          ).expectStatus(200)
      })
    })

    describe('delete', () => {
      it('should delete', () => {
        return pactum
          .spec()
          .delete(
            'http://localhost:3333/task/1'
          ).expectStatus(200)
      })
    })
  })


  it.todo('should pass')
})