import { z } from 'zod';
import { ResourceModel } from '../models/resource.model';
import { ResourceTypeSchema } from './resource-type.schema';

export const ResourceSchema: any = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    typeKey: z.string(),
    info: z.object({}).passthrough(),
    resourceType: ResourceTypeSchema.optional(),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const ResourceUpdateSchema = ResourceSchema.extend({
  id: z.string().uuid(),
  name: z.string().optional(),
  typeKey: z.string().optional(),
  tags: z.array(z.string()).optional(),
  info: z.object({}).passthrough().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

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
export type ResourceUpdateType = z.infer<typeof ResourceUpdateSchema>;
export type ResourcesResponseType = z.infer<typeof ResourcesResponseSchema>;
export type ResourceResponseType = z.infer<typeof ResourceResponseSchema>;
export type ResourcesCountType = z.infer<typeof ResourcesCountSchema>;

// Deserializer / Serializer
export const deserializeResource = (data: ResourceType): ResourceModel => {
  return new ResourceModel(data);
};

export const serializeResource = (data: ResourceModel): ResourceType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
