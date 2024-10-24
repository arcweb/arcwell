import { z } from 'zod';
import { FactSchema } from './fact.schema';
import { FactTypeModel } from '../models/fact-type.model';
import { DimensionSchemaSchema } from '@schemas/dimension-schema.schema';

export const FactTypeSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    observedAt: z.string().datetime({ offset: true }).optional(),
    facts: z.lazy(() => z.array(FactSchema).optional()),
    dimensionSchemas: z.lazy(() =>
      z.array(DimensionSchemaSchema.optional()).optional(),
    ),
    tags: z.array(z.string()).optional(),
    createdAt: z.string().datetime({ offset: true }).optional().nullable(),
    updatedAt: z.string().datetime({ offset: true }).optional().nullable(),
  })
  .strict();

export const FactTypeNewSchema = FactTypeSchema.omit({ id: true });

export const FactTypeUpdateSchema = FactTypeSchema.pick({ id: true }).merge(
  FactTypeSchema.omit({ id: true }).partial(),
);

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
export type FactTypeNewType = z.infer<typeof FactTypeNewSchema>;
export type FactTypeUpdateType = z.infer<typeof FactTypeUpdateSchema>;
export type FactTypesResponseType = z.infer<typeof FactTypesResponseSchema>;
export type FactTypeResponseType = z.infer<typeof FactTypeResponseSchema>;

export const deserializeFactType = (data: FactTypeType): FactTypeModel => {
  return new FactTypeModel(data);
};

// export const serializeFactType = (data: FactTypeModel): FactTypeType => {
//   return {
//     ...data,
//     createdAt: data.createdAt ? data.createdAt.toISO() : undefined,
//     updatedAt: data.updatedAt ? data.updatedAt.toISO() : undefined,
//   };
// };
