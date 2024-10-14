import vine from '@vinejs/vine'

/**
 * Validates the Resource creation action
 */
export const createResourceSchema = vine.object({
  name: vine.string().trim().minLength(3),
})

export const createResourceValidator = vine.compile(createResourceSchema)

/**
 * Validates the Resource update action
 */
export const updateResourceSchema = vine.object({
  name: vine.string().trim().minLength(3).optional(),
})

export const updateResourceValidator = vine.compile(updateResourceSchema)
