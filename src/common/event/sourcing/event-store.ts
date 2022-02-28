import { DomainEvent } from '../../domain/model';
import { DispatchableDomainEvent } from './dispatchable-domain-event';
import { EventNotifiable } from './event-notifiable';
import { EventStream } from './event-stream';
import { EventStreamId } from './event-stream-id';

export interface EventStore {
  appendWidth(
    startingIdentity: EventStreamId,
    events: Array<DomainEvent>,
  ): void;
  close(): void;
  eventsSince(lastRecievedEvent: number): Array<DispatchableDomainEvent>;
  eventStreamSince(identity: EventStreamId): EventStream;
  fullEventStreamFor(identity: EventStreamId): EventStream;
  purge(): void;
  registerEventNotifiable(eventNotifiable: EventNotifiable): void;
}
