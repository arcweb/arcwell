import vine from '@vinejs/vine'

/**
 * Validates the fact's create action
 */
export const createFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    info: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the fact's update action
 */
export const updateFactValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    typeKey: vine.string().trim().optional(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    info: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

export const dimensions = vine.array(vine.object({ key: vine.string(), value: vine.string() }))

export const insertFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim().optional(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    info: vine.object({}).allowUnknownProperties().optional(),
    dimensions: dimensions,
  })
)
