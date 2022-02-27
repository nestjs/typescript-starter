import { IllegalArgumentException } from './illegal-argument.exception';

export class AssertionConcern {
  protected constructor() {
    // super();
  }
  protected assertAgumentEquals(obj1: Object, obj2: Object, msg: string): void {
    if (!(obj1 === obj2)) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertAgumentFalse(b: boolean, msg: string): void {
    if (b) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentLength(s: string, max: number, msg: string): void {
    const length = s.trim().length;
    if (length > max) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentNotEmpty(s: string, msg: string): void {
    if (s === null || s.trim().length === 0) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentNotEquals(
    obj1: Object,
    obj2: Object,
    msg: string,
  ): void {
    if (obj1 === obj2) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentNotNull(obj: Object, msg: string): void {
    if (obj === null) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentRange(
    val: number,
    min: number,
    max: number,
    msg: string,
  ): void {
    if (val < min || val > max) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertArgumentTrue(b: boolean, msg: string): void {
    if (!b) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertStateFalse(b: boolean, msg: string): void {
    if (b) {
      throw new IllegalArgumentException(msg);
    }
  }
  protected assertStateTrue(b: boolean, msg: string): void {
    if (!b) {
      throw new IllegalArgumentException(msg);
    }
  }
}
