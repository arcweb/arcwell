import vine from '@vinejs/vine'

/**
 * Validates the role's creation action
 */
export const createRoleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
  })
)

/**
 * Validates the role's update action
 */
export const updateRoleValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
  })
)
