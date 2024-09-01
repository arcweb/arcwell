import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createTagValidator = vine.compile(
  vine.object({
    pathname: vine.string().trim(),
  })
)

/**
 * Validates the person's update action
 */
export const updateTagValidator = vine.compile(vine.object({}))
