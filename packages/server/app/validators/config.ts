import vine from '@vinejs/vine'
import { createFactTypeSchema } from '#validators/fact_type'

export const installConfigValidator = vine.compile(
  vine.object({
    fact_types: vine.array(createFactTypeSchema).optional(),
  })
);