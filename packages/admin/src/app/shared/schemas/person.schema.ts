import { z } from 'zod';
import { PersonModel } from '@shared/models/person.model';
import { UserSchema } from '@shared/schemas/user.schema';
import { PersonTypeSchema } from './person-type.schema';
import { TagSchema } from '@schemas/tag.schema';
import { CohortSchema } from './cohort.schema';

export const PersonSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    familyName: z.string(),
    givenName: z.string(),
    typeKey: z.string(),
    tags: z.array(TagSchema).optional(),
    user: z.lazy(() => UserSchema.optional().nullable()),
    personType: PersonTypeSchema.optional(),
    cohorts: z.lazy(() => z.array(CohortSchema).optional()),
    cohortsCount: z.number().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

// Validate data going to the API for update
export const PersonUpdateSchema = PersonSchema.extend({
  id: z.string().uuid(),
  familyName: z.string().optional(),
  givenName: z.string().optional(),
  typeKey: z.string().optional(),
  tags: z.array(TagSchema).optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
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
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};
