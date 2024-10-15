import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createEventSchema = vine.object({
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
})

export const createEventValidator = vine.compile(createEventSchema)

/**
 * Validates the person type's update action
 */
export const updateEventSchema = vine.object({
  startedAt: vine.date({ formats: { utc: true } }).optional(),
  endedAt: vine.date({ formats: { utc: true } }).optional(),
})

export const updateEventValidator = vine.compile(updateEventSchema)
