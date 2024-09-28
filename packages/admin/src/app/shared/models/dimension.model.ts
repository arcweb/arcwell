import { DateTime } from 'luxon';
import { FactUpdateType } from '@shared/schemas/fact.schema';

export class DimensionModel {
  public key: string;
  public value: string | number;
  public factId?: string;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactUpdateType) {
    this.key = data.key;
    this.value = data.value;
    this.factId = data.factId;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
