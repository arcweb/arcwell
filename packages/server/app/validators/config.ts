import vine from '@vinejs/vine'
import { createFactTypeSchema } from '#validators/fact_type'
import { createResourceTypeSchema } from '#validators/resource_type';

export const installConfigValidator = vine.compile(
  vine.object({
    fact_types: vine.array(createFactTypeSchema).optional(),
    resource_types: vine.array(createResourceTypeSchema).optional(),
  })
);