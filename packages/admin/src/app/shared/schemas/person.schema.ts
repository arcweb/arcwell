import { z } from 'zod';
import { PersonModel } from '@shared/models/person.model';
import { UserSchema } from '@shared/schemas/user.schema';
import { PersonTypeSchema } from './person-type.schema';

export const PersonSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    familyName: z.string(),
    givenName: z.string(),
    personTypeId: z.string().uuid().optional(),
    tags: z.array(z.any()).optional(),
    user: z.any().optional(), //TODO: this should be UserSchema.optional() but throws error
    personType: z.lazy(() => PersonTypeSchema).optional(),
    createdAt: z.string().datetime({ offset: true }),
    updatedAt: z.string().datetime({ offset: true }),
  })
  .strict();

// Validate data going to the API for update
export const PersonUpdateSchema = PersonSchema.extend({
  id: z.string().uuid(),
  familyName: z.string().optional(),
  givenName: z.string().optional(),
  personTypeId: z.string().uuid().optional(),
  tags: z.array(z.any()).optional(),
}).strict();

//  Multiple People
export const PeopleResponseSchema = z.object({
  data: z.array(PersonSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

// Single Person
export const PersonResponseSchema = z.object({
  data: PersonSchema,
});

export type PersonType = z.infer<typeof PersonSchema>;
export type PersonUpdateType = z.infer<typeof PersonUpdateSchema>;
export type PeopleResponseType = z.infer<typeof PeopleResponseSchema>;
export type PersonResponseType = z.infer<typeof PersonResponseSchema>;

// Deserializer / Serializer
export const deserializePerson = (data: PersonType): PersonModel => {
  return new PersonModel(data);
};

export const serializePerson = (data: PersonModel): PersonType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
