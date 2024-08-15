import { DateTime } from 'luxon';
import { PersonType } from '@shared/schemas/person.schema';

export class PersonTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public info: string;
  public tags: string[];
  public createdAt: DateTime;
  public updatedAt: DateTime;

  constructor(data: PersonType) {
    this.id = data.id;
    this.key = data.familyName;
    this.name = data.givenName;
    this.info = data.personTypeId;
    this.tags = data.tags;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
