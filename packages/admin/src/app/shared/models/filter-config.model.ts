import {
  FilterConfigFieldType,
  deserializeFilterConfigField,
} from '../schemas/filter-config-field.schema';
import { FilterConfigType } from '../schemas/filter-config.schema';
import { FilterConfigFieldModel } from './filter-config-field.model';

export class FilterConfigModel {
  public feature: string;
  public fields: FilterConfigFieldModel[];

  constructor(data: FilterConfigType) {
    this.feature = data.feature;
    this.fields = data.fields
      ? data.fields.map((fieldConfig: FilterConfigFieldType) =>
          deserializeFilterConfigField(fieldConfig),
        )
      : [];
  }

  // add helper methods here
}
