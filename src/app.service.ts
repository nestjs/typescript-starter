import { Injectable } from '@nestjs/common';

@Injectable()
export default class AppService {

  private readonly helloWorld = 'Hello World!';

  getHello(): string {
    return this.helloWorld;
  }
}
