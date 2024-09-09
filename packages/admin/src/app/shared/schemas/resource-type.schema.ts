import { z } from 'zod';
import { ResourceSchema } from './resource.schema';
import { ResourceTypeModel } from '../models/resource-type.model';
import { TagSchema } from '@schemas/tag.schema';

export const ResourceTypeSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    name: z.string(),
    tags: z.array(TagSchema).optional(),
    resources: z.array(ResourceSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const ResourceTypeUpdateSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    tags: z.array(TagSchema).optional(),
    resources: z.array(ResourceSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const ResourceTypesResponseSchema = z.object({
  data: z.array(ResourceTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const ResourceTypeResponseSchema = z.object({
  data: ResourceTypeSchema,
});

export type ResourceTypeType = z.infer<typeof ResourceTypeSchema>;
export type ResourceTypeUpdateType = z.infer<typeof ResourceTypeUpdateSchema>;
export type ResourceTypesResponseType = z.infer<
  typeof ResourceTypesResponseSchema
>;
export type ResourceTypeResponseType = z.infer<
  typeof ResourceTypeResponseSchema
>;

export const deserializeResourceType = (
  data: ResourceTypeType,
): ResourceTypeModel => {
  return new ResourceTypeModel(data);
};

export const serializeResourceType = (
  data: ResourceTypeModel,
): ResourceTypeType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
