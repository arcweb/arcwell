import { DateTime } from 'luxon';
import { EventTypeModel } from '@shared/models/event-type.model';
import { EventType } from '@shared/schemas/event.schema';

interface EventBase {
  name: string;
  source: string;
  typeKey: string;
  tags: string[];
  meta?: object;
  occcurredAt?: DateTime;
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
  public meta?: object;
  public occurredAt?: DateTime;
  public tags: string[];
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public eventType?: EventTypeModel;

  constructor(data: EventType) {
    this.id = data.id;
    this.name = data.name;
    this.source = data.source;
    this.typeKey = data.typeKey;
    this.meta = data.meta;
    this.occurredAt = data.occcurredAt
      ? DateTime.fromISO(data.occcurredAt)
      : undefined;
    this.tags = data.tags;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.eventType = data.eventType
      ? new EventTypeModel(data.eventType)
      : undefined;
  }
}
