import { StoredEvent } from './stored-event';

export interface EventStore {
  allStoredEventBetween(
    lowStoredEventId: number,
    highStoredEventId: number,
  ): Array<StoredEvent>;
}
