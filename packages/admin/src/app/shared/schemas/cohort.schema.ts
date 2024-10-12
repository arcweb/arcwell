import { z } from 'zod';
import { CohortModel } from '../models/cohort.model';
import { PersonSchema } from './person.schema';

export const CohortSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    people: z.lazy(() => z.array(PersonSchema).optional()),
    peopleCount: z.number().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const CohortNewSchema = CohortSchema.omit({ id: true });

export const CohortUpdateSchema = CohortSchema.pick({ id: true }).merge(
  CohortSchema.omit({ id: true }).partial(),
);

export const CohortsResponseSchema = z.object({
  data: z.array(CohortSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const CohortResponseSchema = z.object({
  data: CohortSchema,
});

export type CohortType = z.infer<typeof CohortSchema>;
export type CohortNewType = z.infer<typeof CohortNewSchema>;
export type CohortUpdateType = z.infer<typeof CohortUpdateSchema>;
export type CohortsResponseType = z.infer<typeof CohortsResponseSchema>;
export type CohortResponseType = z.infer<typeof CohortResponseSchema>;

// Deserializer / Serializer
export const deserializeCohort = (
  data: CohortType | CohortNewType,
): CohortModel => {
  return new CohortModel(data);
};

export const serializeCohort = (
  data: CohortModel,
): CohortType | CohortNewType => {
  return {
    ...data,
    createdAt: data.createdAt ? data.createdAt.toISO() : undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toISO() : undefined,
  };
};
