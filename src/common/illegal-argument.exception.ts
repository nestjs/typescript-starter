export class IllegalArgumentException extends Error {
  constructor(message: string) {
    super();
    this.message = message;
  }
}
