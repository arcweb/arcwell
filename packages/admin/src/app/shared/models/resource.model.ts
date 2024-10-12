import { DateTime } from 'luxon';
import { ResourceNewType, ResourceType } from '@schemas/resource.schema';
import { ResourceTypeModel } from './resource-type.model';
import { DimensionModel } from '@shared/models/dimension.model';
import { DimensionType } from '@schemas/dimension.schema';

export class ResourceModel {
  public id?: string;
  public name: string;
  public dimensions?: DimensionModel[];
  public typeKey: string;
  public tags?: string[] | undefined;
  public resourceType?: ResourceTypeModel;
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: ResourceType | ResourceNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.name = data.name;
    this.typeKey = data.typeKey;
    this.tags = data.tags;

    if (data.dimensions) {
      this.dimensions = data.dimensions.map(
        (dimension: DimensionType) => new DimensionModel(dimension),
      );
    }

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);

    this.resourceType = data.resourceType
      ? new ResourceTypeModel(data.resourceType)
      : undefined;
  }
}
