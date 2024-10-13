import { z } from 'zod';
import { ResourceModel } from '../models/resource.model';
import { ResourceTypeSchema } from './resource-type.schema';
import { DimensionSchema, serializeDimension } from '@schemas/dimension.schema';

export const ResourceSchema: any = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    typeKey: z.string(),
    dimensions: z.array(DimensionSchema).optional().nullable(),
    resourceType: z.lazy(() => ResourceTypeSchema.optional()),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const ResourceNewSchema = ResourceSchema.omit({ id: true });

export const ResourceUpdateSchema = ResourceSchema.pick({ id: true }).merge(
  ResourceSchema.omit({ id: true }).partial(),
);

export const ResourcesResponseSchema = z.object({
  data: z.array(ResourceSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const ResourceResponseSchema = z.object({
  data: ResourceSchema,
});

export const ResourcesCountSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export type ResourceType = z.infer<typeof ResourceSchema>;
export type ResourceNewType = z.infer<typeof ResourceNewSchema>;
export type ResourceUpdateType = z.infer<typeof ResourceUpdateSchema>;
export type ResourcesResponseType = z.infer<typeof ResourcesResponseSchema>;
export type ResourceResponseType = z.infer<typeof ResourceResponseSchema>;
export type ResourcesCountType = z.infer<typeof ResourcesCountSchema>;

// Deserializer / Serializer
export const deserializeResource = (
  data: ResourceType | ResourceNewType,
): ResourceModel => {
  return new ResourceModel(data);
};

export const serializeResource = (
  data: ResourceModel,
): ResourceType | ResourceNewType => {
  return {
    ...data,
    dimensions: data.dimensions
      ? data.dimensions.map(dimension => serializeDimension(dimension))
      : undefined,
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};
