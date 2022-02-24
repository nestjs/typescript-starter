import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './base/app/app.module'

const PORT = Number(process.env.PORT || 3001)

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule)
  await app.listen(PORT).then(() => {
    logger.log(`🚀 Server started on port ${PORT}`)
  })
}

bootstrap()
