import { DateTime } from 'luxon';
import { ResourceUpdateType } from '@schemas/resource.schema';
import { ResourceTypeModel } from './resource-type.model';

export class ResourceModel {
  public id?: string;
  public name: string;
  public info?: object;
  public typeKey: string;
  public tags?: string[] | undefined;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public resourceType?: ResourceTypeModel;

  constructor(data: ResourceUpdateType) {
    this.id = data.id;
    this.name = data.name;
    this.info = data.info;
    this.typeKey = data.typeKey;
    this.tags = data.tags;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.resourceType = data.resourceType
      ? new ResourceTypeModel(data.resourceType)
      : undefined;
  }
}
