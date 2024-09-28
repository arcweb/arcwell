import { DateTime } from 'luxon';
import { FactType } from '@shared/schemas/fact.schema';
import { TagType } from '@schemas/tag.schema';
import { TagModel } from '@shared/models/tag.model';
import { DimensionTypeModel } from '@shared/models/dimension-type.model';
import { DimensionTypeType } from '@schemas/dimension-type.schema';

export class FactTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public description?: string;
  public dimensionTypes: DimensionTypeModel[] | undefined;
  public tags?: TagModel[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactType) {
    this.id = data.id;
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags
      ? data.tags.map((tag: TagType) => new TagModel(tag))
      : undefined;

    if (data.dimensionTypes) {
      this.dimensionTypes = data.dimensionTypes.map(
        (dimensionType: DimensionTypeType) =>
          new DimensionTypeModel(dimensionType),
      );
    }

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
