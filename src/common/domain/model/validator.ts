import { ValidationNotificationHandler } from './validation-notification-handler';

export abstract class Validator {
  private _notificationHandler: ValidationNotificationHandler;
  constructor(handler: ValidationNotificationHandler) {
    this.setNotificationHandler(handler);
  }

  protected notificationHandler(): ValidationNotificationHandler {
    return this._notificationHandler;
  }

  private setNotificationHandler(handler: ValidationNotificationHandler): void {
    this._notificationHandler = handler;
  }
}
