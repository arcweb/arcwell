import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import vine from '@vinejs/vine'

/**
 * Validates the resourceType creation action
 */
export const createResourceTypeSchema = vine.object({
  name: vine.string().trim().minLength(3),
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  description: vine.string().trim().optional(),
  tags: vine.array(vine.string().trim()).optional(),
})


export const createResourceTypeValidator = vine.compile(createResourceTypeSchema)

/**
 * Validates the resourceType update action
 */
export const updateResourceTypeSchema = vine.object({
  name: vine.string().trim().minLength(3).optional(),
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  description: vine.string().trim().optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateResourceTypeValidator = vine.compile(updateResourceTypeSchema)
