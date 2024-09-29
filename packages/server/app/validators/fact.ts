import vine from '@vinejs/vine'

export const dimensions = vine.array(vine.object({ key: vine.string(), value: vine.any() }))

/**
 * Validates the fact's create action
 */
export const createFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    info: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
    dimensions: dimensions,
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
    dimensions: dimensions,
    tags: vine.array(vine.string().trim()).optional(),
  })
)

export const insertDataFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    person_id: vine.string().trim().uuid().optional().nullable(),
    resource_id: vine.string().trim().uuid().optional().nullable(),
    event_id: vine.string().trim().uuid().optional().nullable(),
    dimensions: dimensions,
  })
)

export const updateDataFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine
      .date({ formats: { utc: true } })
      .optional()
      .optional(),
    person_id: vine.string().trim().uuid().optional().nullable().optional(),
    resource_id: vine.string().trim().uuid().optional().nullable().optional(),
    event_id: vine.string().trim().uuid().optional().nullable().optional(),
    dimensions: dimensions.optional(),
  })
)
