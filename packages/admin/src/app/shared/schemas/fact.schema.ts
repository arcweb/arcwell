import { z } from 'zod';
import { FactModel } from '@shared/models/fact.model';
import { UserSchema } from '@shared/schemas/user.schema';
import { FactTypeSchema } from './fact-type.schema';
import { TagSchema } from '@schemas/tag.schema';
import { PersonSchema } from '@schemas/person.schema';
import { EventSchema } from '@schemas/event.schema';
import { ResourceSchema } from '@schemas/resource.schema';
import { DimensionSchema } from '@schemas/dimension.schema';

export const FactSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    typeKey: z.string(),
    person: z.lazy(() => PersonSchema.optional().nullable()),
    resource: z.lazy(() => ResourceSchema.optional().nullable()),
    event: z.lazy(() => EventSchema.optional().nullable()),
    personId: z.string().uuid().optional().nullable(),
    resourceId: z.string().uuid().optional().nullable(),
    eventId: z.string().uuid().optional().nullable(),
    observedAt: z.string().datetime({ offset: true }).optional().nullable(),
    dimensions: z.array(DimensionSchema).optional().nullable(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    factType: z.lazy(() => FactTypeSchema.optional()),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

// Validate data going to the API for update
export const FactUpdateSchema = FactSchema.extend({
  id: z.string().uuid(),
  typeKey: z.string().optional(),
  person: z.lazy(() => PersonSchema.optional().nullable()),
  resource: z.lazy(() => ResourceSchema.optional().nullable()),
  event: z.lazy(() => EventSchema.optional().nullable()),
  personId: z.string().uuid().optional().nullable(),
  resourceId: z.string().uuid().optional().nullable(),
  eventId: z.string().uuid().optional().nullable(),
  observedAt: z.string().datetime({ offset: true }).optional().nullable(),
  dimensions: z.array(DimensionSchema).optional().nullable(),
  tags: z.lazy(() => z.array(TagSchema).optional()),
  factType: z.lazy(() => FactTypeSchema.optional()),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

//  Multiple Facts
export const FactsResponseSchema = z.object({
  data: z.array(FactSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

// Single Fact
export const FactResponseSchema = z.object({
  data: FactSchema,
});

export const FactsCountSchema = z.object({
  data: z.object({
    count: z.number(),
  }),
});

export type FactType = z.infer<typeof FactSchema>;
export type FactUpdateType = z.infer<typeof FactUpdateSchema>;
export type FactsResponseType = z.infer<typeof FactsResponseSchema>;
export type FactResponseType = z.infer<typeof FactResponseSchema>;
export type FactsCountType = z.infer<typeof FactsCountSchema>;

// Deserializer / Serializer
export const deserializeFact = (data: FactType): FactModel => {
  return new FactModel(data);
};

export const serializeFact = (data: FactModel): FactType => {
  return {
    ...data,
    observedAt: data.observedAt?.toISO() ?? undefined,
    createdAt: data.createdAt?.toISO() ?? undefined,
    updatedAt: data.updatedAt?.toISO() ?? undefined,
  };
};
