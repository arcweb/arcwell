import { z } from 'zod';
import { FeatureModel } from '../models/feature.model';
import { SubFeatureSchema } from './subfeature.schema';

// TODO: Look at using z.lazy() to avoid circular dependency and define subfeatures without using FeatureSchemaBase
export const FeatureSchema: any = z
  .object({
    name: z.string(),
    path: z.string(),
    icon: z.string(),
    subfeatures: z.array(SubFeatureSchema).optional(),
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
