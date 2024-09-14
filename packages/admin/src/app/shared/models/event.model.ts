import { DateTime } from 'luxon';
import { EventTypeModel } from '@shared/models/event-type.model';
import { EventType } from '@shared/schemas/event.schema';
import { TagType } from '@schemas/tag.schema';
import { TagModel } from '@shared/models/tag.model';

interface EventBase {
  name: string;
  source: string;
  typeKey: string;
  tags?: TagModel[];
  info?: object;
  occurredAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
  eventType?: EventTypeModel;
}

export interface EventPreSave extends EventBase {
  id?: never;
}

export interface EventPostSave extends EventBase {
  id: string;
}

export class EventModel {
  public id?: string;
  public name: string;
  public source: string;
  public typeKey: string;
  public info?: object;
  public occurredAt?: DateTime;
  public tags?: TagModel[];
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public eventType?: EventTypeModel;

  constructor(data: EventType) {
    this.id = data.id;
    this.name = data.name;
    this.source = data.source;
    this.typeKey = data.typeKey;
    this.info = data.info;
    this.occurredAt = data.occurredAt
      ? DateTime.fromISO(data.occurredAt)
      : undefined;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;
    this.eventType = data.eventType
      ? new EventTypeModel(data.eventType)
      : undefined;
  }
}
