import { NotFoundException } from '@nestjs/common';

export class CartNotFoundException extends NotFoundException {
  constructor(userId: number) {
    super(`User's ${userId} active cart was not found`);
  }
}
