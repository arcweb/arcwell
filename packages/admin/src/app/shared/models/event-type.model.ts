import { DateTime } from 'luxon';
import { EventTypeType } from '@shared/schemas/event-type.schema';

export class EventTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public tags: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: EventTypeType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.tags = data.tags;
    this.createdAt = data.createdAt
      ? DateTime.fromISO(data.createdAt)
      : undefined;
    this.updatedAt = data.updatedAt
      ? DateTime.fromISO(data.updatedAt)
      : undefined;
  }
}
