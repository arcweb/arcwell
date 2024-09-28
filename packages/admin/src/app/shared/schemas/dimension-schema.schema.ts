import { z } from 'zod';
import { DimensionSchemaModel } from '@shared/models/dimension-schema.model';

export const DimensionSchemaSchema: any = z.object({
  id: z.string().uuid().optional(),
  key: z.string(),
  name: z.string(),
  dataType: z.string(),
  dataUnit: z.string().optional(),
  isRequired: z.boolean(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});

// Validate data going to the API for update
export const DimensionSchemaUpdateSchema = DimensionSchemaSchema.extend({
  id: z.string().uuid(),
  key: z.string().optional(),
  name: z.string().optional(),
  dataType: z.string(),
  dataUnit: z.string().optional(),
  isRequired: z.boolean(),
  factId: z.string().uuid().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
});

//  Multiple People
export const DimensionSchemasResponseSchema = z.object({
  data: z.array(DimensionSchemaSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const DimensionSchemasSimpleResponseSchema = z.object({
  data: z.array(z.string()),
});

// Single Person
export const DimensionSchemaResponseSchema = z.object({
  data: DimensionSchemaSchema,
});

export type DimensionSchemaType = z.infer<typeof DimensionSchemaSchema>;
export type DimensionSchemaUpdateType = z.infer<
  typeof DimensionSchemaUpdateSchema
>;
export type DimensionSchemasResponseType = z.infer<
  typeof DimensionSchemasResponseSchema
>;
export type DimensionSchemaResponseType = z.infer<
  typeof DimensionSchemaResponseSchema
>;
export type DimensionSchemasSimpleResponseType = z.infer<
  typeof DimensionSchemasSimpleResponseSchema
>;

// Deserializer / Serializer
export const deserializeDimensionSchema = (
  data: DimensionSchemaType,
): DimensionSchemaModel => {
  return new DimensionSchemaModel(data);
};

export const serializeDimensionSchema = (
  data: DimensionSchemaModel,
): DimensionSchemaType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
