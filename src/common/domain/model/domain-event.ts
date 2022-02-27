export interface DomainEvent {
  eventVersion(): number;
  occurredOn(): Date;
}
