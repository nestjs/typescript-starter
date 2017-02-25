import { Component } from 'nest.js';

@Component()
export class NotificationService {
    storeNotification(data) {
        const notification = this.mapDataToNotification(data);
        // store notification
    }

    private mapDataToNotification(msg) {}
}