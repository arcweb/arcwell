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

export const createFactTypeSchema = vine.object({
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  name: vine.string(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateFactTypeSchema = vine.object({
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  name: vine.string().optional(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

/**
 * Validates the factType's create action
 */
export const createFactTypeValidator = vine.compile(createFactTypeSchema)

/**
 * Validates an array of factTypes for the install action
 */
export const createFactTypeArrayValidator = vine.compile(
  vine.array(
    createFactTypeSchema
  )
)

/**
 * Validates the factType's update action
 */
export const updateFactTypeValidator = vine.compile(updateFactTypeSchema)
