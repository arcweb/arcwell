import { z } from 'zod';
import { EventSchema } from './event.schema';
import { EventTypeModel } from '../models/event-type.model';
import {
  DimensionSchemaSchema,
  serializeDimensionSchema,
} from '@schemas/dimension-schema.schema';

export const EventTypeSchema: any = z
  .object({
    id: z.string().uuid(),
    key: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    dimensionSchemas: z.lazy(() =>
      z.array(DimensionSchemaSchema.optional()).optional(),
    ),
    tags: z.array(z.string()).optional(),
    events: z.array(EventSchema).optional(),
    createdAt: z.string().datetime({ offset: true }).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  })
  .strict();

export const EventTypeNewSchema = EventTypeSchema.omit({ id: true });

export const EventTypeUpdateSchema = EventTypeSchema.pick({
  id: true,
}).merge(EventTypeSchema.omit({ id: true }).partial());

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
export type EventTypeNewType = z.infer<typeof EventTypeNewSchema>;
export type EventTypeUpdateType = z.infer<typeof EventTypeUpdateSchema>;
export type EventTypesResponseType = z.infer<typeof EventTypesResponseSchema>;
export type EventTypeResponseType = z.infer<typeof EventTypeResponseSchema>;

export const deserializeEventType = (data: EventTypeType): EventTypeModel => {
  return new EventTypeModel(data);
};

export const serializeEventType = (data: EventTypeModel): EventTypeType => {
  return {
    ...data,
    dimensionSchemas: data.dimensionSchemas
      ? data.dimensionSchemas.map(dimensionSchema =>
          serializeDimensionSchema(dimensionSchema),
        )
      : undefined,
    createdAt: data.createdAt?.toISO(),
    updatedAt: data.updatedAt?.toISO(),
  };
};
