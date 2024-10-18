import { z } from 'zod';
import { DimensionSchemaModel } from '@shared/models/dimension-schema.model';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const DimensionSchemaSchema: any = z.object({
  key: z.string(),
  name: z.string(),
  dataType: z.string(),
  dataUnit: z.string().optional().nullable(),
  isRequired: z.boolean(),
});

// Validate data going to the API for update
export const DimensionSchemaUpdateSchema = DimensionSchemaSchema.extend({
  key: z.string().optional(),
  name: z.string().optional(),
  dataType: z.string(),
  dataUnit: z.string().optional().nullable(),
  isRequired: z.boolean(),
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
  };
};
