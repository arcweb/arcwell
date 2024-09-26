import { DateTime } from 'luxon';
import { CohortUpdateType } from '../schemas/cohort.schema';
import { TagType } from '../schemas/tag.schema';
import { TagModel } from './tag.model';
import { PersonModel } from './person.model';
import { PersonType } from '../schemas/person.schema';

interface CohortBase {
  name: string;
  description?: string;
  rules?: object;
  people?: PersonModel[] | undefined;
  peopleCount?: number;
  tags?: TagModel[] | undefined;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface CohortPreSave extends CohortBase {
  id?: never;
}

export interface CohortPostSave extends CohortBase {
  id: string;
}

export class CohortModel {
  public id?: string;
  public name: string;
  public description?: string;
  public rules?: object;
  public tags?: TagModel[] | undefined;
  public people?: PersonModel[] | undefined;
  public peopleCount?: number;

  public createdAt: DateTime;
  public updatedAt: DateTime;

  constructor(data: CohortUpdateType) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.rules = data.rules;
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;
    this.people = data.people
      ? data.people.map((person: PersonType) => new PersonModel(person))
      : undefined;
    this.peopleCount = data.peopleCount ||= 0;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
