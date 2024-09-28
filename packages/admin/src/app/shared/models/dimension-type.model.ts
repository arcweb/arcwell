import { DateTime } from 'luxon';
import { FactUpdateType } from '@shared/schemas/fact.schema';

export class DimensionTypeModel {
  public key: string;
  public name: string;
  public dataType: string;
  public dataUnit: string;
  public isRequired: boolean;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactUpdateType) {
    this.key = data.key;
    this.name = data.name;
    this.dataType = data.dataType;
    this.dataUnit = data.dataUnit;
    this.isRequired = data.isRequired;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
