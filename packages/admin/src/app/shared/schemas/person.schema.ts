import { z } from 'zod';
import { PersonModel } from '@shared/models/person.model';
import { serializeUser, UserSchema } from '@shared/schemas/user.schema';
import { PersonTypeSchema } from './person-type.schema';
import { CohortSchema } from './cohort.schema';
import { DimensionSchema, serializeDimension } from '@schemas/dimension.schema';

export const PersonSchema: any = z
  .object({
    id: z.string().uuid(),
    familyName: z.string(),
    givenName: z.string(),
    typeKey: z.string(),
    dimensions: z.array(DimensionSchema).optional().nullable(),
    tags: z.array(z.string()).optional(),
    user: z.lazy(() => UserSchema.optional().nullable()),
    personType: z.lazy(() => PersonTypeSchema.optional()),
    cohorts: z.lazy(() => z.array(CohortSchema).optional()),
    cohortsCount: z.number().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const PersonNewSchema = PersonSchema.omit({ id: true });

export const PersonUpdateSchema = PersonSchema.pick({ id: true }).merge(
  PersonSchema.omit({ id: true }).partial(),
);

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

export const PeopleCountSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export type PersonType = z.infer<typeof PersonSchema>;
export type PersonNewType = z.infer<typeof PersonNewSchema>;
export type PersonUpdateType = z.infer<typeof PersonUpdateSchema>;
export type PeopleResponseType = z.infer<typeof PeopleResponseSchema>;
export type PersonResponseType = z.infer<typeof PersonResponseSchema>;
export type PeopleCountType = z.infer<typeof PeopleCountSchema>;

// Deserializer / Serializer
export const deserializePerson = (data: PersonType): PersonModel => {
  return new PersonModel(data);
};

export const serializePerson = (data: PersonModel): PersonType => {
  return {
    ...data,
    user: data.user ? serializeUser(data.user) : undefined,
    dimensions: data.dimensions
      ? data.dimensions.map(dimension => serializeDimension(dimension))
      : undefined,
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};
