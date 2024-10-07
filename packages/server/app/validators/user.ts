import vine from '@vinejs/vine'

/**
 * Validates the role's create action
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    roleId: vine.string().trim().uuid(),
  })
)

/**
 * Validates the role's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)
