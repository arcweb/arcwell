import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import vine from '@vinejs/vine'

/**
 * Validates the factType's create action
 */
export const createFactTypeValidator = vine.compile(
  vine.object({
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    name: vine.string().trim(),
    // TODO: Add validation to the dimensionTypes
    dimensionTypes: vine.array(vine.object({}).allowUnknownProperties()).optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the factType's update action
 */
export const updateFactTypeValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    name: vine.string().trim().optional(),
    // TODO: Add validation to the dimensionTypes
    dimensionTypes: vine.array(vine.object({}).allowUnknownProperties()).optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)
