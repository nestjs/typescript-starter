import { NotFoundException } from '@nestjs/common';

export class CartNotFoundException extends NotFoundException {
  constructor() {
    super(`User's active cart was not found`);
  }
}
