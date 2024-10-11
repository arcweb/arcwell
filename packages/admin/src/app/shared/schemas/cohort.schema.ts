import { z } from 'zod';
import { CohortModel } from '../models/cohort.model';
import { PersonSchema } from './person.schema';

export const CohortSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    description: z.string().optional().nullable(),
    rules: z.object({}).passthrough(),
    tags: z.array(z.string()).optional(),
    people: z.lazy(() => z.array(PersonSchema).optional()),
    peopleCount: z.number().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const CohortUpdateSchema = CohortSchema.extend({
  id: z.string().uuid(),
  name: z.string().optional(),
  description: z.string().optional().nullable(),
  rules: z.object({}).passthrough().optional(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

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
export type CohortUpdateType = z.infer<typeof CohortUpdateSchema>;
export type CohortsResponseType = z.infer<typeof CohortsResponseSchema>;
export type CohortResponseType = z.infer<typeof CohortResponseSchema>;

// Deserializer / Serializer
export const deserializeCohort = (data: CohortType): CohortModel => {
  return new CohortModel(data);
};

export const serializeCohort = (data: CohortModel): CohortType => {
  return {
    ...data,
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
