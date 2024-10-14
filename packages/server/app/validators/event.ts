import vine from '@vinejs/vine'

export const createEventSchema = vine.object({
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
})

export const updateEventSchema = vine.object({
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
})

/**
 * Validates the person type's creation action
 */
export const createEventValidator = vine.compile(createEventSchema)

/**
 * Validates the person type's update action
 */
export const updateEventValidator = vine.compile(updateEventSchema)
