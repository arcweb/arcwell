import { z } from 'zod';
import { SubFeatureModel } from '../models/sub-feature.model';
import { FeatureSchema } from './feature.schema';

export const SubFeatureSchema = FeatureSchema.extend({
  icon: z.string().optional(),
});

export type SubFeatureType = z.infer<typeof SubFeatureSchema>;

export const deserializeSubFeature = (
  data: SubFeatureType,
): SubFeatureModel => {
  return new SubFeatureModel(data);
};

export const serializeSubFeature = (data: SubFeatureModel): SubFeatureType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
