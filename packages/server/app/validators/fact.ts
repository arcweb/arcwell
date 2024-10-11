import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const dimensions = vine.array(
  vine.object({ key: vine.string(), value: vine.any() }).optional()
)

/**
 * Validates the fact's create action
 */
export const createFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    info: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().optional()).optional(),
    dimensions: dimensions,
  })
)

/**
 * Validates the fact's update action
 */
export const updateFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().optional(),
    observedAt: vine
      .string()
      .transform((value) => DateTime.fromISO(value))
      .optional(),
    // observedAt: vine.date({ formats: { utc: true } }).optional(),
    dimensions: dimensions.optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

export const insertDataFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine
      .string()
      .transform((value) => DateTime.fromISO(value))
      .optional(),
    // observedAt: vine.date({ formats: { utc: true } }).optional(),
    person_id: vine.string().uuid().optional().nullable(),
    resource_id: vine.string().uuid().optional().nullable(),
    event_id: vine.string().uuid().optional().nullable(),
    dimensions: dimensions,
  })
)

export const updateDataFactValidator = vine.compile(
  vine.object({
    typeKey: vine.string().trim(),
    observedAt: vine.date({ formats: { utc: true } }).optional(),
    person_id: vine.string().uuid().optional().nullable().optional(),
    resource_id: vine.string().uuid().optional().nullable().optional(),
    event_id: vine.string().uuid().optional().nullable().optional(),
    dimensions: dimensions.optional(),
  })
)
