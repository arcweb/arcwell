import { DateTime } from 'luxon';
import { EventTypeModel } from '@shared/models/event-type.model';
import { EventType } from '@shared/schemas/event.schema';
import { TagType } from '@schemas/tag.schema';
import { TagModel } from '@shared/models/tag.model';
import { PersonType } from '@schemas/person.schema';
import { ResourceType } from '@schemas/resource.schema';
import { PersonModel } from '@shared/models/person.model';
import { ResourceModel } from '@shared/models/resource.model';

interface EventBase {
  typeKey: string;
  tags?: TagModel[];
  info?: object;
  startedAt?: DateTime;
  endedAt?: DateTime;
  createdAt: DateTime;
  updatedAt: DateTime;
  eventType?: EventTypeModel;
  personId?: string;
  person?: PersonType;
  resourceId?: string;
  resource?: ResourceType;
}

export interface EventPreSave extends EventBase {
  id?: never;
}

export interface EventPostSave extends EventBase {
  id: string;
}

export class EventModel {
  public id?: string;
  public typeKey: string;
  public info?: object;
  public startedAt?: DateTime;
  public endedAt?: DateTime;
  public tags?: TagModel[];
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public eventType?: EventTypeModel;
  public personId?: string;
  public resourceId?: string;
  public person?: PersonType;
  public resource?: ResourceType;

  constructor(data: EventType) {
    this.id = data.id;
    this.typeKey = data.typeKey;
    this.info = data.info;
    this.startedAt = data.startedAt
      ? DateTime.fromISO(data.startedAt)
      : undefined;
    this.endedAt = data.endedAt ? DateTime.fromISO(data.endedAt) : undefined;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;
    this.eventType = data.eventType
      ? new EventTypeModel(data.eventType)
      : undefined;
    this.personId = data.personId;
    this.resourceId = data.resourceId;
    if (data.person) this.person = new PersonModel(data.person);
    if (data.resource) this.resource = new ResourceModel(data.resource);
  }
}
