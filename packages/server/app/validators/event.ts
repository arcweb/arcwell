import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createEventValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
  })
)

/**
 * Validates the person type's update action
 */
export const updateEventValidator = vine.compile(vine.object({}))
