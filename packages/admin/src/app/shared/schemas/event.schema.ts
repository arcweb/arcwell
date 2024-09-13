import { z } from 'zod';
import { EventTypeSchema } from './event-type.schema';
import { EventModel } from '../models/event.model';
import { TagSchema } from '@schemas/tag.schema';
import { FactSchema } from './fact.schema';

export const EventSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string(),
    source: z.string(),
    meta: z.array(z.any()).optional().nullable(),
    typeKey: z.string(),
    tags: z.array(TagSchema).optional(),
    facts: z.array(FactSchema).optional(),
    eventType: EventTypeSchema.optional(),
    occurredAt: z.string().datetime({ offset: true }).optional().nullable(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const EventUpdateSchema = EventSchema.extend({
  id: z.string().uuid(),
  name: z.string().optional(),
  source: z.string().optional(),
  typeKey: z.string().optional(),
  tags: z.array(TagSchema).optional(),
  occurredAt: z.string().datetime({ offset: true }).optional(),
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
    occurredAt: data.occurredAt?.toISO(),
    createdAt: data.createdAt.toISO(),
    updatedAt: data.updatedAt.toISO(),
  };
};
