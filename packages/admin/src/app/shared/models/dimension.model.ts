import { DimensionType } from '@schemas/dimension.schema';

export class DimensionModel {
  public key: string;
  public value: string | number | Date;

  constructor(data: DimensionType) {
    this.key = data.key;
    this.value = data.value;
  }
}
