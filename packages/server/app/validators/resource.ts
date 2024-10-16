import vine from '@vinejs/vine'
import { dimensions } from '#validators/dimension'

/**
 * Validates the Resource creation action
 */
export const createResourceSchema = vine.object({
  name: vine.string().trim().minLength(3),
  typeKey: vine.string().trim(),
  dimensions: dimensions.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const createResourceValidator = vine.compile(createResourceSchema)

/**
 * Validates the Resource update action
 */
export const updateResourceSchema = vine.object({
  name: vine.string().trim().minLength(3).optional(),
  typeKey: vine.string().trim().optional(),
  dimensions: dimensions.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateResourceValidator = vine.compile(updateResourceSchema)
