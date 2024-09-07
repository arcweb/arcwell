import { DateTime } from 'luxon';
import { PersonType } from '@shared/schemas/person.schema';
import { TagType } from '@schemas/tag.schema';
import { TagModel } from '@shared/models/tag.model';

export class PersonTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public info: string;
  public tags?: TagModel[] | undefined;
  public createdAt: DateTime;
  public updatedAt: DateTime;

  constructor(data: PersonType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.info = data.info;
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
