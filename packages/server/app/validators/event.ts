import vine from '@vinejs/vine'
import { dimensions } from '#validators/dimension'

/**
 * Validates the person type's creation action
 */
export const createEventSchema = vine.object({
  typeKey: vine.string().trim(),
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
  dimensions: dimensions.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const createEventValidator = vine.compile(createEventSchema)

/**
 * Validates the person type's update action
 */
export const updateEventSchema = vine.object({
  typeKey: vine.string().trim(),
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
  dimensions: dimensions.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateEventValidator = vine.compile(updateEventSchema)
