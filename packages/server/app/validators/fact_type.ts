import vine from '@vinejs/vine'

/**
 * Validates the factType's create action
 */
export const createFactTypeValidator = vine.compile(
  vine.object({
    key: vine.string().trim(),
    name: vine.string().trim(),
    dimensions: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the factType's update action
 */
export const updateFactTypeValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    key: vine.string().trim().optional(),
    name: vine.string().trim().optional(),
    dimensions: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
