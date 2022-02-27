import { IllegalArgumentException } from '../../illegal-argument.exception';
import { Entity } from './entity';

export class ConcurrencySafeEntity extends Entity {
  _concurrencyVersion: number;
  concurrencyVersion(): number {
    return this._concurrencyVersion;
  }
  setConcurrencyVersion(version: number): void {
    this.failWhenConcurrencyViolation(version);
    this._concurrencyVersion = version;
  }
  failWhenConcurrencyViolation(version: number): void {
    if (version !== this._concurrencyVersion) {
      throw new IllegalArgumentException(
        'Concurrency Violation: Stale data detected. Entity was already modified.',
      );
    }
  }
}
