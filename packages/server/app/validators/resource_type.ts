import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createResourceTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  })
)

/**
 * Validates the person type's update action
 */
export const updateResourceTypeValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    description: vine.string().trim().optional(),
  })
)
