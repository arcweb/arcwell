import { z } from 'zod';
import { FilterConfigFieldSchema } from './filter-config-field.schema';
import { FilterConfigModel } from '../models/filter-config.model';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const FilterConfigSchema: any = z
  .object({
    feature: z.string(),
    fields: z.lazy(() => z.array(FilterConfigFieldSchema).optional()),
  })
  .strict();

export const FilterConfigResponseSchema = z.object({
  data: z.array(FilterConfigSchema),
});

export type FilterConfigType = z.infer<typeof FilterConfigSchema>;
export type FilterConfigResponseType = z.infer<
  typeof FilterConfigResponseSchema
>;

export const deserializeFilterConfig = (
  data: FilterConfigType,
): FilterConfigModel => {
  return new FilterConfigModel(data);
};

export const serializeFilterConfig = (
  data: FilterConfigModel,
): FilterConfigType => {
  return {
    ...data,
  };
};
