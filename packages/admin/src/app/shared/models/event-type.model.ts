import { DateTime } from 'luxon';
import { EventTypeType } from '@shared/schemas/event-type.schema';
import { TagModel } from '@shared/models/tag.model';
import { TagType } from '@schemas/tag.schema';

export class EventTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public tags?: TagModel[] | undefined;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: EventTypeType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;

    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
