import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createResourceTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().minLength(3),
  })
)

/**
 * Validates the person type's update action
 */
export const updateResourceTypeValidator = vine.compile(vine.object({}))
