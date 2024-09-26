import { DateTime } from 'luxon';
import { FactUpdateType } from '@shared/schemas/fact.schema';
import { DimensionTypeType } from '@schemas/dimension-type.schema';

// Base interface with common properties
interface DimensionTypeBase {
  key: string;
  name: string;
  dataType: string;
  dataUnit: string;
  isRequired: boolean;
  dimensionTypes: DimensionTypeType[];
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

// TODO: WIP.  This might be a decent way make id required after saving
// Interface for fact before saving (no id)
export interface FactPreSave extends DimensionTypeBase {
  id?: never;
}

// Interface for fact after saving (id is required)
export interface FactPostSave extends DimensionTypeBase {
  id: string;
}

export class DimensionTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public dataType: string;
  public dataUnit: string;
  public isRequired: boolean;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactUpdateType) {
    this.id = data.id;
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
