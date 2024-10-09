import { z } from 'zod';
import { EventSchema } from './event.schema';
import { EventTypeModel } from '../models/event-type.model';
import { TagSchema } from '@schemas/tag.schema';

export const EventTypeSchema: any = z
  .object({
    id: z.string().uuid().optional(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    events: z.array(EventSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const EventTypeUpdateSchema = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    tags: z.lazy(() => z.array(TagSchema).optional()),
    events: z.array(EventSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const EventTypesResponseSchema = z.object({
  data: z.array(EventTypeSchema),
  meta: z
    .object({
      count: z.number(),
    })
    .optional(),
});

export const EventTypeResponseSchema = z.object({
  data: EventTypeSchema,
});

export type EventTypeType = z.infer<typeof EventTypeSchema>;
export type EventTypeUpdateType = z.infer<typeof EventTypeUpdateSchema>;
export type EventTypesResponseType = z.infer<typeof EventTypesResponseSchema>;
export type EventTypeResponseType = z.infer<typeof EventTypeResponseSchema>;

export const deserializeEventType = (data: EventTypeType): EventTypeModel => {
  return new EventTypeModel(data);
};

export const serializeEventType = (data: EventTypeModel): EventTypeType => {
  return {
    ...data,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
