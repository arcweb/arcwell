import vine from '@vinejs/vine'
import { createEventTypeSchema } from '#validators/event_type';
import { createFactTypeSchema } from '#validators/fact_type'
import { createResourceTypeSchema } from '#validators/resource_type';
import { createRoleSchema } from '#validators/role';

export const installConfigValidator = vine.compile(
  vine.object({
    event_types: vine.array(createEventTypeSchema).optional(),
    fact_types: vine.array(createFactTypeSchema).optional(),
    resource_types: vine.array(createResourceTypeSchema).optional(),
    roles: vine.array(createRoleSchema).optional(),
  })
);