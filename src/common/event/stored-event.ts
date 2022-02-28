import { AssertionConcern } from '..';
import { DomainEvent } from '../domain/model';
import { IllegalArgumentException } from '../illegal-argument.exception';

export class StoredEvent extends AssertionConcern {
  private _eventBody: string;
  private _eventId: number;
  private _occurredOn: Date;
  private _typeName: string;

  eventBody(): string {
    return this._eventBody;
  }

  eventId(): number {
    return this._eventId;
  }

  occurredOn(): Date {
    return this._occurredOn;
  }

  typeName(): string {
    return this._typeName;
  }

  toDomainEvent<T extends DomainEvent>() {
    var domainEventClass: T = null;
    try {
      domainEventClass = this.typeName();
    } catch (e) {
      throw new IllegalArgumentException(
        'Class load error, because: ' + (e as Error).message,
      );
    }
    var domainEvent: T = EventSerializer.instance().deserialize(
      this.eventBody,
      domainEventClass,
    );
    return domainEvent;
  }
}
