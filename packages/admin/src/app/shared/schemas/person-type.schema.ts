import { z } from 'zod';
import { PersonSchema } from './person.schema';
import { PersonTypeModel } from '../models/person-type.model';
import { TagSchema } from '@schemas/tag.schema';

export const PersonTypeSchema = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    people: z.array(PersonSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const PersonTypeUpdateSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    people: z.array(PersonSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

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
export type PersonTypeUpdateType = z.infer<typeof PersonTypeUpdateSchema>;
export type PersonTypesResponseType = z.infer<typeof PersonTypesResponseSchema>;
export type PersonTypeResponseType = z.infer<typeof PersonTypeResponseSchema>;

export const deserializePersonType = (
  data: PersonTypeType,
): PersonTypeModel => {
  return new PersonTypeModel(data);
};

export const serializePersonType = (data: PersonTypeModel): PersonTypeType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
