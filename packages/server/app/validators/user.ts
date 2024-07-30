import vine from '@vinejs/vine'

/**
 * Validates the role's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3),
    email: vine.string().email().normalizeEmail(),
    // TODO: Finish
  })
)
