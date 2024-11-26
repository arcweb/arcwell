import { HttpParams } from '@angular/common/http';
import { FeatureFilter } from '../interfaces/feature-filter';

export function buildFilterParams(
  filters: FeatureFilter[],
  params: HttpParams,
): HttpParams {
  filters.forEach(filter => {
    // Use params.append so the same filter configuration can appear as a param more than once.
    // Format: filter[columnName][operator]=value or dim[columnName][operator]=value
    let value = filter.value;
    if (filter.field.type === 'datetime') {
      value = new Date(filter.value.toString()).toISOString();
    }
    params = params.append(
      `${filter.field.filterType}[${filter.field.columnName}][${filter.operator.name}]`,
      value,
    );
  });
  return params;
}
