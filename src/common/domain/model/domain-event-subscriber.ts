export interface DomainEventSubscriber<T> {
  handleEvent(event: T): void;
  subscribedToEventType(): string;
}
