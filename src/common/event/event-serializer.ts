import { AbstractSerializer } from '../serializer/abstract-serializer';
import { DomainEvent } from '../domain/model/domain-event';

export class EventSerializer extends AbstractSerializer {
  private static _eventSerializer: EventSerializer;
  static instance(): EventSerializer {
    if (EventSerializer._eventSerializer === null) {
      EventSerializer._eventSerializer = new EventSerializer();
    }
    return EventSerializer._eventSerializer;
  }

  constructor(isCompact: boolean);
  constructor(isCompact: boolean, isPretty?: boolean) {
    super(isCompact, isPretty || false);
  }

  serialize(domainEvent: DomainEvent) {
    return JSON.stringify(domainEvent);
  }

  deserialize<T extends DomainEvent>(serialization: string): T {
    var domainEvent: T = Object.setPrototypeOf(
      JSON.parse(serialization),
      DomainEvent.prototype,
    );
    // var domainEvent: T = Object.assign(new DomainEvent(), JSON.parse(serialization));
    return domainEvent;
  }
}
