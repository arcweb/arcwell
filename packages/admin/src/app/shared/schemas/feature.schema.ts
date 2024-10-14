import { z } from 'zod';
import { FeatureModel } from '../models/feature.model';
import { SubFeatureSchema } from './subfeature.schema';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const FeatureSchema: any = z
  .object({
    name: z.string(),
    path: z.string(),
    icon: z.string(),
    subfeatures: z.lazy(() => z.array(SubFeatureSchema).optional()),
  })
  .strict();

export const FeatureResponseSchema = z.object({
  data: z.array(FeatureSchema),
});

export type FeatureType = z.infer<typeof FeatureSchema>;
export type FeatureResponseType = z.infer<typeof FeatureResponseSchema>;

export const deserializeFeature = (data: FeatureType): FeatureModel => {
  return new FeatureModel(data);
};

export const serializeFeature = (data: FeatureModel): FeatureType => {
  return {
    ...data,
  };
};
