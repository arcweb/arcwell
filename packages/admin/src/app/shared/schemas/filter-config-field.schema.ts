import { z } from 'zod';
import { FilterConfigFieldModel } from '../models/filter-config-field.model';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const FilterConfigFieldSchema: any = z
  .object({
    name: z.string(),
    columnName: z.string(),
    type: z.string(),
    title: z.string(),
    filterType: z.string(),
  })
  .strict();

export type FilterConfigFieldType = z.infer<typeof FilterConfigFieldSchema>;

export const deserializeFilterConfigField = (
  data: FilterConfigFieldType,
): FilterConfigFieldModel => {
  return new FilterConfigFieldModel(data);
};

export const serializeFilterConfigField = (
  data: FilterConfigFieldModel,
): FilterConfigFieldType => {
  return {
    ...data,
  };
};
