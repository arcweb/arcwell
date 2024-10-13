import vine from '@vinejs/vine'
import { createFactTypeSchema } from '#validators/fact_type'
import { createResourceTypeSchema } from '#validators/resource_type';
import { createEventTypeSchema } from '#validators/event_type';

export const installConfigValidator = vine.compile(
  vine.object({
    event_types: vine.array(createEventTypeSchema).optional(),
    fact_types: vine.array(createFactTypeSchema).optional(),
    resource_types: vine.array(createResourceTypeSchema).optional(),
  })
);