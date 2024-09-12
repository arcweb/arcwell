import { z } from 'zod';
import { FactSchema } from './fact.schema';
import { FactTypeModel } from '../models/fact-type.model';
import { TagSchema } from '@schemas/tag.schema';

export const FactTypeSchema = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    observedAt: z.string().datetime({ offset: true }).optional(),
    facts: z.array(FactSchema).optional(),
    tags: z.array(TagSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const FactTypeUpdateSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional().nullable(),
    observedAt: z.string().datetime({ offset: true }).optional(),
    facts: z.array(FactSchema).optional(),
    tags: z.array(TagSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const FactTypesResponseSchema = z.object({
  data: z.array(FactTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const FactTypeResponseSchema = z.object({
  data: FactTypeSchema,
});

export type FactTypeType = z.infer<typeof FactTypeSchema>;
export type FactTypeUpdateType = z.infer<typeof FactTypeUpdateSchema>;
export type FactTypesResponseType = z.infer<typeof FactTypesResponseSchema>;
export type FactTypeResponseType = z.infer<typeof FactTypeResponseSchema>;

export const deserializeFactType = (data: FactTypeType): FactTypeModel => {
  return new FactTypeModel(data);
};

export const serializeFactType = (data: FactTypeModel): FactTypeType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
