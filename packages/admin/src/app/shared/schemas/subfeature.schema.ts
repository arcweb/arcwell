import { z } from 'zod';
import { SubfeatureModel } from '../models/subfeature.model';
import { FeatureSchema } from './feature.schema';

export const SubFeatureSchema = FeatureSchema.extend({
  icon: z.string().optional(),
});

export type SubfeatureType = z.infer<typeof SubFeatureSchema>;

export const deserializeSubfeature = (
  data: SubfeatureType,
): SubfeatureModel => {
  return new SubfeatureModel(data);
};

export const serializeSubfeature = (data: SubfeatureModel): SubfeatureType => {
  return {
    ...data,
  };
};
