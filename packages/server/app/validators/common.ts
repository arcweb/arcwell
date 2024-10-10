import vine from '@vinejs/vine'

/**
 * Common validators to be used my any controller
 */
export const paramsUUIDValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
  })
)

export const paramsTripleObjectUUIDValidator = vine.compile(
  vine.object({
    person_id: vine.string().uuid().optional().nullable(),
    resource_id: vine.string().uuid().optional().nullable(),
    event_id: vine.string().uuid().optional().nullable(),
  })
)
