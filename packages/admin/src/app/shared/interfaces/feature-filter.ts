import { DateTime } from 'luxon';
import { FilterConfigFieldModel } from '../models/filter-config-field.model';

export interface FeatureFilterOperator {
  name: string;
  label: string;
}

export interface FeatureFilter {
  field: FilterConfigFieldModel;
  operator: FeatureFilterOperator;
  value: string | number | boolean;
}
