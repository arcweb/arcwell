import { DateTime } from 'luxon';
import { EventTypeType } from '@shared/schemas/event-type.schema';

export class EventTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public description?: string;
  public tags?: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: EventTypeType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;

    this.tags = data.tags;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
