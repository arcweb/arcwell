import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createPersonTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().minLength(3),
  })
)

/**
 * Validates the person type's update action
 */
export const updatePersonTypeValidator = vine.compile(vine.object({}))
