import { DateTime } from 'luxon';
import { CohortNewType, CohortType } from '@schemas/cohort.schema';
import { PersonModel } from './person.model';
import { PersonType } from '@schemas/person.schema';

export class CohortModel {
  public id?: string;
  public name: string;
  public description?: string;
  public tags?: string[] | undefined;
  public people?: PersonModel[] | undefined;
  public peopleCount?: number;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: CohortType | CohortNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags;
    this.people = data.people
      ? data.people.map(
          (person: PersonType /* TODO Add PersonNewType */) =>
            new PersonModel(person),
        )
      : undefined;
    this.peopleCount = data.peopleCount ||= 0;
    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
