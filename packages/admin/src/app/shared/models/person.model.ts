import { DateTime } from 'luxon';
import { PersonType } from '@shared/schemas/person.schema';
import { PersonTypeModel } from '@shared/models/person-type.model';

// Base interface with common properties
interface PersonBase {
  familyName: string;
  givenName: string;
  personTypeId: string;
  tags: string[];
  createdAt: DateTime;
  updatedAt: DateTime;
  personType?: PersonTypeModel;
}

// TODO: WIP.  This might be a decent way make id required after saving
// Interface for person before saving (no id)
export interface PersonPreSave extends PersonBase {
  id?: never;
}

// Interface for person after saving (id is required)
export interface PersonPostSave extends PersonBase {
  id: string;
}

export class PersonModel {
  public id?: string;
  public familyName: string;
  public givenName: string;
  public personTypeId: string;
  public tags: string[];
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public personType?: PersonTypeModel;

  constructor(data: PersonType) {
    this.id = data.id;
    this.familyName = data.familyName;
    this.givenName = data.givenName;
    this.personTypeId = data.personTypeId;
    this.tags = data.tags;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.personType = data.personType
      ? new PersonTypeModel(data.personType)
      : undefined;
  }

  // add helper methods here
}
