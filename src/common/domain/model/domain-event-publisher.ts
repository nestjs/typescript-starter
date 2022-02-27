import { DomainEventSubscriber } from './domain-event-subscriber';

export class DomainEventPublisher {
  private static readonly _instance: DomainEventPublisher = new DomainEventPublisher();

  private _publishing: boolean;

  private _subscribers: [];

  public static instance(): DomainEventPublisher {
    return DomainEventPublisher._instance;
  }

  public publish<T>(event: T): void {
    if (!this.isPublishing() && this.hasSubscriber()) {
      try {
        this.setPublishing(true);
        var eventType = event.constructor.name;
        var allSubscribers: DomainEventSubscriber<T>[] = this.subscribers();
        allSubscribers.forEach((subscriber) => {
          var subscribedToType = subscriber.subscribedToEventType();
          // || subscribedToType === DomainEvent.constructor.name
          if (eventType === subscribedToType) {
            subscriber.handleEvent(event);
          }
        });
      } finally {
        this.setPublishing(false);
      }
    }
  }

  isPublishing(): boolean {
    return this._publishing;
  }

  setPublishing(flag: boolean): void {
    this._publishing = flag;
  }

  hasSubscriber(): boolean {
    return this.subscribers() != null;
  }

  subscribers() {
    return this._subscribers;
  }
}
