import { z } from 'zod';
import { PersonNewType, PersonSchema } from './person.schema';
import { PersonTypeModel } from '../models/person-type.model';
import {
  DimensionSchemaSchema,
  serializeDimensionSchema,
} from '@schemas/dimension-schema.schema';

export const PersonTypeSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    dimensionSchemas: z.lazy(() =>
      z.array(DimensionSchemaSchema.optional()).optional(),
    ),
    tags: z.array(z.string()).optional(),
    people: z.array(PersonSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const PersonTypeNewSchema = PersonTypeSchema.omit({ id: true });

export const PersonTypeUpdateSchema = PersonTypeSchema.pick({
  id: true,
}).merge(PersonTypeSchema.omit({ id: true }).partial());

export const PersonTypesResponseSchema = z.object({
  data: z.array(PersonTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const PersonTypeResponseSchema = z.object({
  data: PersonTypeSchema,
});

export type PersonTypeType = z.infer<typeof PersonTypeSchema>;
export type PersonTypeNewType = z.infer<typeof PersonTypeNewSchema>;
export type PersonTypeUpdateType = z.infer<typeof PersonTypeUpdateSchema>;
export type PersonTypesResponseType = z.infer<typeof PersonTypesResponseSchema>;
export type PersonTypeResponseType = z.infer<typeof PersonTypeResponseSchema>;

export const deserializePersonType = (
  data: PersonTypeType,
): PersonTypeModel => {
  return new PersonTypeModel(data);
};

export const serializePersonType = (
  data: PersonTypeModel,
): PersonTypeType | PersonNewType => {
  return {
    ...data,
    dimensionSchemas: data.dimensionSchemas
      ? data.dimensionSchemas.map(dimensionSchema =>
          serializeDimensionSchema(dimensionSchema),
        )
      : undefined,
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};
