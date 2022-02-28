export interface ValidationNotificationHandler {
  handleError(notificationMsg: string);
  handleError(notification: string, obj: Object);
  handleInfo(notificationMsg: string);
  handleInfo(notification: string, obj: Object);
  handleWarning(notificationMsg: string);
  handleWarning(notification: string, obj: object);
}
