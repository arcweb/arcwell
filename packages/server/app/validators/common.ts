import vine from '@vinejs/vine'

/**
 * Common validators to be used my any controller
 */
export const paramsUUIDValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
  })
)
