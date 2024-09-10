import { DateTime } from 'luxon';
import { ResourceUpdateType } from '../schemas/resource.schema';
import { TagType } from '../schemas/tag.schema';
import { ResourceTypeModel } from './resource-type.model';
import { TagModel } from './tag.model';

interface ResourceBase {
  name: string;
  meta: object;
  typeKey: string;
  tags?: TagModel[] | undefined;
  createdAt: DateTime;
  updatedAt: DateTime;
  resourceType?: ResourceTypeModel;
}

export interface ResourcePreSave extends ResourceBase {
  id?: never;
}

export interface ResourcePostSave extends ResourceBase {
  id: string;
}

export class ResourceModel {
  public id?: string;
  public name: string;
  public meta?: object;
  public typeKey: string;
  public tags?: TagModel[] | undefined;
  public createdAt: DateTime;
  public updatedAt: DateTime;
  public resourceType?: ResourceTypeModel;

  constructor(data: ResourceUpdateType) {
    this.id = data.id;
    this.name = data.name;
    this.meta = data.meta ? data.meta : undefined;
    this.typeKey = data.typeKey;
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;
    this.createdAt = DateTime.fromISO(data.createdAt);
    this.updatedAt = DateTime.fromISO(data.updatedAt);
    this.resourceType = data.resourceType
      ? new ResourceTypeModel(data.resourceType)
      : undefined;
  }
}
