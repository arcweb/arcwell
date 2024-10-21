export enum ToastLevel {
  ERROR = 'error',
  INFO = 'info',
  SUCCESS = 'success',
}

export class ToastMessage {
  timeStamp: number;
  heading?: string;
  message: string;
  level: string;

  constructor(message: string, level?: ToastLevel, heading?: string) {
    this.heading = heading;
    this.message = message;
    this.level = level || ToastLevel.INFO;
    this.timeStamp = Date.now();
  }
}
