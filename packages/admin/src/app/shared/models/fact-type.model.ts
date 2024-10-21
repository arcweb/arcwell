import { DateTime } from 'luxon';
import { FactType } from '@shared/schemas/fact.schema';
import { DimensionSchemaModel } from '@shared/models/dimension-schema.model';
import { DimensionSchemaType } from '@schemas/dimension-schema.schema';
import { FactTypeNewType } from '@schemas/fact-type.schema';

export class FactTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public description?: string;
  public dimensionSchemas?: DimensionSchemaModel[];
  public tags?: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FactType | FactTypeNewType) {
    if ('id' in data && data.id) {
      this.id = data.id;
    }
    this.key = data.key;
    this.name = data.name;
    this.description = data.description;
    this.tags = data.tags;

    if (data.dimensionSchemas) {
      this.dimensionSchemas = data.dimensionSchemas.map(
        (dimensionSchema: DimensionSchemaType) =>
          new DimensionSchemaModel(dimensionSchema),
      );
    }

    if (data.createdAt) this.createdAt = DateTime.fromISO(data.createdAt);
    if (data.updatedAt) this.updatedAt = DateTime.fromISO(data.updatedAt);
  }

  // add helper methods here
}
