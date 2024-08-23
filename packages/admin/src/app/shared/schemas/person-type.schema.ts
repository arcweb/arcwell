import { z } from 'zod';
import { PersonSchema } from './person.schema';
import { PersonTypeModel } from '../models/person-type.model';

export const PersonTypeSchema = z
  .object({
    id: z.string().optional(),
    key: z.string(),
    name: z.string(),
    info: z.string(),
    tags: z.array(z.string()),
    people: z.array(PersonSchema).optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

export const PersonTypeResponseSchema = z.object({
  data: z.array(PersonTypeSchema),
  meta: z.array(z.any()).optional(),
});

export type PersonTypeType = z.infer<typeof PersonTypeSchema>;
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
