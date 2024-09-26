import { z } from 'zod';
import { DimensionTypeModel } from '@shared/models/dimension-type.model';

export const DimensionTypeSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    name: z.string(),
    dataType: z.string(),
    dataUnit: z.string(),
    isRequired: z.string(), // z.boolean(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

// Validate data going to the API for update
export const DimensionTypeUpdateSchema = DimensionTypeSchema.extend({
  id: z.string().uuid(),
  key: z.string().optional(),
  name: z.string().optional(),
  dataType: z.string(),
  dataUnit: z.string(),
  isRequired: z.string(), // z.boolean(),
  factId: z.string().uuid().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple People
export const DimensionTypesResponseSchema = z.object({
  data: z.array(DimensionTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const DimensionTypesSimpleResponseSchema = z.object({
  data: z.array(z.string()),
});

// Single Person
export const DimensionTypeResponseSchema = z.object({
  data: DimensionTypeSchema,
});

export type DimensionTypeType = z.infer<typeof DimensionTypeSchema>;
export type DimensionTypeUpdateType = z.infer<typeof DimensionTypeUpdateSchema>;
export type DimensionTypesResponseType = z.infer<
  typeof DimensionTypesResponseSchema
>;
export type DimensionTypeResponseType = z.infer<
  typeof DimensionTypeResponseSchema
>;
export type DimensionTypesSimpleResponseType = z.infer<
  typeof DimensionTypesSimpleResponseSchema
>;

// Deserializer / Serializer
export const deserializeDimensionType = (
  data: DimensionTypeType,
): DimensionTypeModel => {
  return new DimensionTypeModel(data);
};

export const serializeDimensionType = (
  data: DimensionTypeModel,
): DimensionTypeType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
