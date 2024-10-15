import vine from '@vinejs/vine'
import { DateTime } from 'luxon'

export const dimensionSchema = vine.object({
  key: vine.string(),
  value: vine.any(),
})

export const dimensions = vine.array(dimensionSchema.optional())

/**
 * Validates the fact's create action
 */
export const createFactSchema = vine.object({
  typeKey: vine.string().trim(),
  observedAt: vine.date({ formats: { utc: true } }).optional(),
  info: vine.object({}).allowUnknownProperties().optional(),
  tags: vine.array(vine.string().optional()).optional(),
  dimensions: dimensions,
})

export const createFactValidator = vine.compile(createFactSchema)

/**
 * Validates the fact's update action
 */
export const updateFactSchema = vine.object({
  typeKey: vine.string().optional(),
  observedAt: vine
    .string()
    .transform((value) => DateTime.fromISO(value))
    .optional(),
  dimensions: dimensions.optional(),
  tags: vine.array(vine.string().optional()).optional(),
})

export const updateFactValidator = vine.compile(updateFactSchema)

/**
 * Validates the data fact's insert action
 */
export const insertDataFactSchema = vine.object({
  typeKey: vine.string().trim(),
  observedAt: vine
    .string()
    .transform((value) => DateTime.fromISO(value))
    .optional(),
  person_id: vine.string().uuid().optional().nullable(),
  resource_id: vine.string().uuid().optional().nullable(),
  event_id: vine.string().uuid().optional().nullable(),
  dimensions: dimensions,
})

export const insertDataFactValidator = vine.compile(insertDataFactSchema)

/**
 * Validates the data fact's update action
 */
export const updateDataFactSchema = vine.object({
  typeKey: vine.string().optional(),
  observedAt: vine.date({ formats: { utc: true } }).optional(),
  person_id: vine.string().uuid().optional().nullable(),
  resource_id: vine.string().uuid().optional().nullable(),
  event_id: vine.string().uuid().optional().nullable(),
  dimensions: dimensions.optional(),
})
