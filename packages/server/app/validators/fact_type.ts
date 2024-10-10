import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import vine from '@vinejs/vine'

const dimensionSchemas = vine.array(
  vine.object({
    key: vine.string().trim(),
    name: vine.string(),
    dataType: vine.string(),
    dataUnit: vine.string().optional(),
    isRequired: vine.boolean(),
  })
)
/**
 * Validates the factType's create action
 */
export const createFactTypeValidator = vine.compile(
  vine.object({
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    name: vine.string(),
    dimensionSchemas: dimensionSchemas.optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the factType's update action
 */
export const updateFactTypeValidator = vine.compile(
  vine.object({
    id: vine.string().uuid(),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    name: vine.string().optional(),
    dimensionSchemas: dimensionSchemas.optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
