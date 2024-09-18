import vine from '@vinejs/vine'
import { TYPE_KEY_PATTERN } from '#constants/validation_constants'

/**
 * Validates the person type's creation action
 */
export const createPersonTypeValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    description: vine.string().trim().optional(),
  })
)

/**
 * Validates the person type's update action
 */
export const updatePersonTypeValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    name: vine.string().trim().minLength(3),
    key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
    description: vine.string().trim().optional(),
  })
)
