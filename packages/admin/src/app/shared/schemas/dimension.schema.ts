import { z } from 'zod';
import { DimensionModel } from '@shared/models/dimension.model';

export const DimensionSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    value: z.string(),
    factId: z.string().uuid().optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

// Validate data going to the API for update
export const DimensionUpdateSchema = DimensionSchema.extend({
  id: z.string().uuid(),
  key: z.string().optional(),
  value: z.string().optional(),
  factId: z.string().uuid().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple People
export const DimensionsResponseSchema = z.object({
  data: z.array(DimensionSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const DimensionsSimpleResponseSchema = z.object({
  data: z.array(z.string()),
});

// Single Person
export const DimensionResponseSchema = z.object({
  data: DimensionSchema,
});

export type DimensionType = z.infer<typeof DimensionSchema>;
export type DimensionUpdateType = z.infer<typeof DimensionUpdateSchema>;
export type DimensionsResponseType = z.infer<typeof DimensionsResponseSchema>;
export type DimensionResponseType = z.infer<typeof DimensionResponseSchema>;
export type DimensionsSimpleResponseType = z.infer<
  typeof DimensionsSimpleResponseSchema
>;

// Deserializer / Serializer
export const deserializeDimension = (data: DimensionType): DimensionModel => {
  return new DimensionModel(data);
};

export const serializeDimension = (data: DimensionModel): DimensionType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
