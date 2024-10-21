import { DimensionSchemaType } from '@schemas/dimension-schema.schema';

export class DimensionSchemaModel {
  public key: string;
  public name: string;
  public dataType: string;
  public dataUnit: string | null | undefined;
  public isRequired: boolean;

  constructor(data: DimensionSchemaType) {
    this.key = data.key;
    this.name = data.name;
    this.dataType = data.dataType;
    this.dataUnit = data.dataUnit;
    this.isRequired = data.isRequired ?? true;
  }
}
