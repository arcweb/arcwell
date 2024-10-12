import { DimensionType } from '@schemas/dimension.schema';

export class DimensionModel {
  public key: string;
  public value: string | number;
  public factId?: string;

  constructor(data: DimensionType) {
    this.key = data.key;
    this.value = data.value;
    this.factId = data.factId;
  }
}
