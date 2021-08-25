import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  sendMessage(message, number): object {
    return {
      message: message,
      number: number
    }
  }
  mySuperLongProcessOfUser(data: any) {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log(`done processing ${JSON.stringify(data)}`);
        resolve();
      }, 30000);
    });
  }
}
