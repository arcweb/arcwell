import { z } from 'zod';
import { FeatureModel } from '../models/feature.model';

const FeatureSchemaBase: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    path: z.string(),
    icon: z.string(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const SubFeatureSchema = FeatureSchemaBase.extend({
  icon: z.string().optional(),
});

export const FeatureSchema = FeatureSchemaBase.extend({
  subFeatures: z.array(SubFeatureSchema).optional(),
});

export const FeatureResponseSchema = z.object({
  data: z.array(FeatureSchema),
});

export type FeatureType = z.infer<typeof FeatureSchema>;
export type SubFeatureType = z.infer<typeof SubFeatureSchema>;
export type FeatureResponseType = z.infer<typeof FeatureResponseSchema>;

export const deserializeFeature = (data: FeatureType): FeatureModel => {
  return new FeatureModel(data);
};

export const serializeFeature = (data: FeatureModel): FeatureType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
