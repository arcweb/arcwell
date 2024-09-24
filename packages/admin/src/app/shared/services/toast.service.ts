import { Injectable } from '@angular/core';

import { ToastLevel, ToastMessage } from '../models';
import { ErrorResponseType } from '../schemas/error.schema';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  // TODO: Make this work with signals
  private messages: ToastMessage[] = [];

  constructor() {}

  // autoremove message after set time
  autoRemoveMessage(msgId: number, timeout: number) {
    setTimeout(() => this.removeMessage(msgId), timeout);
  }

  // get the messages to display to the user
  getMessages(): ToastMessage[] {
    return this.messages;
  }

  // remove the message
  removeMessage(msgId: number) {
    const idx = this.messages.findIndex(m => m.timeStamp === msgId);
    this.messages.splice(idx, 1);
  }

  // display a new message to the user
  sendMessage(
    msg: string,
    level: ToastLevel,
    timeout = 5000,
    heading?: string,
  ) {
    const newMsg = heading
      ? new ToastMessage(msg, level, heading)
      : new ToastMessage(msg, level);

    this.messages.push(newMsg);
    this.autoRemoveMessage(newMsg.timeStamp, timeout);
  }

  // send an http error toast
  sendHttpError(error: ErrorResponseType, timeout = 5000) {
    const heading = error.title;
    const message = error.detail || '';
    this.sendMessage(message, ToastLevel.ERROR, timeout, heading);
  }
}
