import vine from '@vinejs/vine'

/**
 * Validates the Resource creation action
 */
export const createResourceValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
  })
)

/**
 * Validates the Resource update action
 */
export const updateResourceValidator = vine.compile(vine.object({}))
