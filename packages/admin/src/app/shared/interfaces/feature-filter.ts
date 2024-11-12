import { DateTime } from 'luxon';

export interface FeatureFilter {
  field: string;
  operator: string;
  value: string | number | boolean | DateTime;
}
