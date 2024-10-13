import vine from '@vinejs/vine'

export const createRoleSchema = vine.object({
  name: vine.string().trim().minLength(3),
})

export const updateRoleSchema = vine.object({
  name: vine.string().trim().minLength(3),
})

/**
 * Validates the Role create action
 */
export const createRoleValidator = vine.compile(createRoleSchema)

/**
 * Validates the Role update action
 */
export const updateRoleValidator = vine.compile(updateRoleSchema)
