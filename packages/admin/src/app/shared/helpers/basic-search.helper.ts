import { HttpParams } from '@angular/common/http';

const defaultSearchFields: Record<string, string[]> = {
  cohorts: ['name'],
  event_types: ['name'],
  fact_types: ['name'],
  people: ['family_name', 'given_name'],
  person_types: ['name'],
  resources: ['name'],
  resource_types: ['name'],
  tags: ['pathname'],
  users: ['email'],
};

export function buildBasicSearchForFeature(
  featureName: string,
  searchString: string,
): { field: string; searchString: string }[] {
  const result: { field: string; searchString: string }[] = [];
  defaultSearchFields[featureName].forEach((key: string) => {
    result.push({ field: key, searchString });
  });
  return result;
}

export function buildSearchParams(
  search: { field: string; searchString: string }[],
  params: HttpParams,
): HttpParams {
  search.forEach(searchItem => {
    if (searchItem.field && searchItem.searchString) {
      // Format: search[field]=searchString
      params = params.set(
        `search[${searchItem.field}]`,
        searchItem.searchString,
      );
    }
  });
  return params;
}
