import { DateTime } from 'luxon';
import { DimensionSchemaType } from '../schemas/dimension-schema.schema';
import { FileTypeNewType } from '../schemas/file-type.schema';
import { FileType } from '../schemas/file.schema';
import { DimensionSchemaModel } from './dimension-schema.model';

export class FileTypeModel {
  public id?: string;
  public key: string;
  public name: string;
  public description?: string;
  public dimensionSchemas?: DimensionSchemaModel[];
  public tags?: string[];
  public createdAt?: DateTime;
  public updatedAt?: DateTime;

  constructor(data: FileType | FileTypeNewType) {
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
}
