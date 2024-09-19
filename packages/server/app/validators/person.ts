import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createPersonValidator = vine.compile(
  vine.object({
    familyName: vine.string().trim(),
    givenName: vine.string().trim(),
    typeKey: vine.string().trim(),
    // TODO: replace vine.any() with a proper schema
    cohorts: vine.array(vine.any()).optional(),
  })
)

/**
 * Validates the person's update action
 */
export const updatePersonValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    familyName: vine.string().trim().optional(),
    givenName: vine.string().trim().optional(),
    typeKey: vine.string().trim().optional(),
    tags: vine.array(vine.object({}).allowUnknownProperties()).optional(),
  })
)
