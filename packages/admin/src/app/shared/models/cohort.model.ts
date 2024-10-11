import { DateTime } from 'luxon';
import { CohortType } from '@schemas/cohort.schema';
import { PersonModel } from './person.model';
import { PersonType } from '@schemas/person.schema';

interface CohortBase {
  name: string;
  description?: string;
  people?: PersonModel[] | undefined;
  peopleCount?: number;
  tags?: string[] | undefined;
  createdAt?: DateTime;
  updatedAt?: DateTime;
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
  public tags?: string[] | undefined;
  public people?: PersonModel[] | undefined;
  public peopleCount?: number;

  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: CohortType) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags;
    this.people = data.people
      ? data.people.map((person: PersonType) => new PersonModel(person))
      : undefined;
    this.peopleCount = data.peopleCount ||= 0;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
