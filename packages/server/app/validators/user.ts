import vine from '@vinejs/vine'

export const createUserSchema = vine.object({
  email: vine.string().email().normalizeEmail(),
  roleId: vine.string().trim().uuid(),
})

export const updateUserSchema = vine.object({
  email: vine.string().email().normalizeEmail(),
})

/**
 * Validates the role's create action
 */
export const createUserValidator = vine.compile(createUserSchema)

/**
 * Validates the role's update action
 */
export const updateUserValidator = vine.compile(updateUserSchema)
