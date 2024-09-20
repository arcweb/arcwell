import vine from '@vinejs/vine'

/**
 * Validators for email controller
 */
export const paramsEmailValidator = vine.compile(
  vine.object({
    email: vine.string().email(),
  })
)
