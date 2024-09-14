import vine from '@vinejs/vine'

/**
 * Validates the person type's creation action
 */
export const createEventValidator = vine.compile(
  vine.object({
    startedAt: vine.date({ formats: { utc: true } }).optional(),
    endedAt: vine.date({ formats: { utc: true } }).optional(),
  })
)

/**
 * Validates the person type's update action
 */
export const updateEventValidator = vine.compile(
  vine.object({
    startedAt: vine.date({ formats: { utc: true } }).optional(),
    endedAt: vine.date({ formats: { utc: true } }).optional(),
  })
)
