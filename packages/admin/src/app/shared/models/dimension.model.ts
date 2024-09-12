import { DateTime } from 'luxon';
import { FactUpdateType } from '@shared/schemas/fact.schema';

// Base interface with common properties
interface DimensionBase {
  key: string;
  value: string;
  factId?: string;
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

// TODO: WIP.  This might be a decent way make id required after saving
// Interface for fact before saving (no id)
export interface FactPreSave extends DimensionBase {
  id?: never;
}

// Interface for fact after saving (id is required)
export interface FactPostSave extends DimensionBase {
  id: string;
}

export class DimensionModel {
  public id?: string;
  public key: string;
  public value: string;
  public factId?: string;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactUpdateType) {
    this.id = data.id;
    this.key = data.key;
    this.value = data.value;
    this.factId = data.factId;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
