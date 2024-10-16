import vine from '@vinejs/vine'
import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import { dimensionSchemas } from '#validators/dimension'

/**
 * Validates the person type's creation action
 */
export const createEventTypeSchema = vine.object({
  name: vine.string().trim().minLength(3),
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  description: vine.string().trim().optional(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const createEventTypeValidator = vine.compile(createEventTypeSchema)

/**
 * Validates the person type's update action
 */
export const updateEventTypeSchema = vine.object({
  name: vine.string().trim().minLength(3).optional(),
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  description: vine.string().trim().optional(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateEventTypeValidator = vine.compile(updateEventTypeSchema)
