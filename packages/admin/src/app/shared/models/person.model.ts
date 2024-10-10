import { DateTime } from 'luxon';
import { PersonUpdateType } from '@shared/schemas/person.schema';
import { PersonTypeModel } from '@shared/models/person-type.model';
import { UserModel } from '@shared/models/user.model';
import { UserType } from '@schemas/user.schema';
import { CohortModel } from '@shared/models/cohort.model';
import { CohortType } from '@schemas/cohort.schema';

// Base interface with common properties
interface PersonBase {
  familyName: string;
  givenName: string;
  typeKey: string;
  tags?: string[];
  info?: object;
  cohorts?: CohortModel[] | undefined;
  cohortsCount?: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  personType?: PersonTypeModel;
  user?: UserType;
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
  public typeKey: string;
  public tags?: string[];
  public info?: object;
  public cohorts?: CohortModel[] | undefined;
  public cohortsCount?: number;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public personType?: PersonTypeModel;
  public user?: UserModel;

  constructor(data: PersonUpdateType) {
    this.id = data.id;
    this.familyName = data.familyName;
    this.givenName = data.givenName;
    this.typeKey = data.typeKey;
    this.tags = data.tags;
    this.info = data.info;
    this.cohorts = data.cohorts
      ? data.cohorts.map((cohort: CohortType) => new CohortModel(cohort))
      : undefined;
    this.cohortsCount = data.cohortsCount ||= 0;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.personType = data.personType
      ? new PersonTypeModel(data.personType)
      : undefined;
    this.user = data.user ? new UserModel(data.user) : undefined;
  }

  // add helper methods here
}
