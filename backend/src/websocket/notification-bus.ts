import EventEmitter from 'events';

export interface AppEvent {
  type: string;
  payload: any;
  room?: string;
}

class NotificationBus extends EventEmitter {
  emitEvent(event: AppEvent) {
    this.emit('app-event', event);
  }
}

export const notificationBus = new NotificationBus();
