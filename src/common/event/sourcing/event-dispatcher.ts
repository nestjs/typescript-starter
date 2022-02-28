import { DispatchableDomainEvent } from './dispatchable-domain-event';

export interface EventDispatcher {
  dispatch(dispatchableDomainEvent: DispatchableDomainEvent): void;
  registerEventDispatcher(eventDispatcher: EventDispatcher): void;
  understands(dispatchDomainEvent: DispatchableDomainEvent): boolean;
}
