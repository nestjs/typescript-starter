import { DomainEvent } from '../../domain/model';

export interface EventStream {
  events(): Array<DomainEvent>;
  version(): number;
}
