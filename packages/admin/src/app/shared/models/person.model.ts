import { DateTime } from 'luxon';
import { PersonNewType, PersonType } from '@shared/schemas/person.schema';
import { PersonTypeModel } from '@shared/models/person-type.model';
import { UserModel } from '@shared/models/user.model';
import { CohortModel } from '@shared/models/cohort.model';
import { CohortType } from '@schemas/cohort.schema';
import { DimensionModel } from '@shared/models/dimension.model';
import { DimensionType } from '@schemas/dimension.schema';

export class PersonModel {
  public id?: string;
  public familyName: string;
  public givenName: string;
  public typeKey: string;
  public dimensions?: DimensionModel[];
  public tags?: string[];
  public cohorts?: CohortModel[];
  public cohortsCount?: number;
  public personType?: PersonTypeModel;
  public user?: UserModel;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: PersonType | PersonNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.familyName = data.familyName;
    this.givenName = data.givenName;
    this.typeKey = data.typeKey;
    this.tags = data.tags;
    if (data.dimensions) {
      this.dimensions = data.dimensions.map(
        (dimension: DimensionType) => new DimensionModel(dimension),
      );
    }
    this.cohorts = data.cohorts
      ? data.cohorts.map((cohort: CohortType) => new CohortModel(cohort))
      : undefined;
    this.cohortsCount = data.cohortsCount ?? 0;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.personType = data.personType
      ? new PersonTypeModel(data.personType)
      : undefined;
    this.user = data.user ? new UserModel(data.user) : undefined;
  }

  // add helper methods here
}
