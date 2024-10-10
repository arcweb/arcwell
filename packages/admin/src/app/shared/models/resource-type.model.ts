import { DateTime } from 'luxon';
import { ResourceTypeType } from '@shared/schemas/resource-type.schema';

export class ResourceTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public description?: string;
  public tags?: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: ResourceTypeType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags;

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }
}
