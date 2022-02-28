import { DomainEvent } from '../../domain/model';

export class DispatchableDomainEvent {
  private _domainEvent: DomainEvent;
  private _eventId: number;

  constructor(eventId: number, domainEvent: DomainEvent) {
    this._domainEvent = domainEvent;
    this._eventId = eventId;
  }

  domainEvent(): DomainEvent {
    return this._domainEvent;
  }

  eventId() {
    return this._eventId;
  }
}
