import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log("my change");
    return 'Hello World!';
  }
}
