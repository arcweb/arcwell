import { z } from 'zod';
import { EventTypeSchema } from './event-type.schema';
import { EventModel } from '../models/event.model';
import { TagSchema } from '@schemas/tag.schema';
import { FactSchema } from './fact.schema';
import { PersonSchema } from '@schemas/person.schema';
import { ResourceSchema } from '@schemas/resource.schema';

export const EventSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    typeKey: z.string(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    info: z.object({}).passthrough(),
    eventType: EventTypeSchema.optional(),
    startedAt: z.string().datetime({ offset: true }),
    endedAt: z.string().datetime({ offset: true }).optional().nullable(),
    person: z.lazy(() => PersonSchema.optional().nullable()),
    resource: z.lazy(() => ResourceSchema.optional().nullable()),
    personId: z.string().uuid().optional().nullable(),
    resourceId: z.string().uuid().optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const EventUpdateSchema = EventSchema.extend({
  id: z.string().uuid(),
  typeKey: z.string().optional(),
  tags: z.lazy(() => z.array(TagSchema).optional()),
  info: z.object({}).passthrough().optional(),
  startedAt: z.string().datetime({ offset: true }).optional(),
  endedAt: z.string().datetime({ offset: true }).optional().nullable(),
  person: z.lazy(() => PersonSchema.optional().nullable()),
  resource: z.lazy(() => ResourceSchema.optional().nullable()),
  personId: z.string().uuid().optional().nullable(),
  resourceId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime({ offset: true }).optional(),
  updatedAt: z.string().datetime({ offset: true }).optional(),
}).strict();

export const EventsResponseSchema = z.object({
  data: z.array(EventSchema),
  meta: z.object({ count: z.number() }).optional(),
});

export const EventResponseSchema = z.object({
  data: EventSchema,
});

export type EventType = z.infer<typeof EventSchema>;
export type EventUpdateType = z.infer<typeof EventUpdateSchema>;
export type EventsResponseType = z.infer<typeof EventsResponseSchema>;
export type EventResponseType = z.infer<typeof EventResponseSchema>;

// Deserializer / Serializer
export const deserializeEvent = (data: EventType): EventModel => {
  return new EventModel(data);
};

export const serializeEvent = (data: EventModel): EventType => {
  return {
    ...data,
    startedAt: data.startedAt?.toISO(),
    endedAt: data.endedAt?.toISO() ?? undefined,
    createdAt: data.createdAt.toISO() ?? undefined,
    updatedAt: data.updatedAt.toISO() ?? undefined,
  };
};
