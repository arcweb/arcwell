import { TYPE_KEY_PATTERN } from '#constants/validation_constants'
import vine from '@vinejs/vine'
import { dimensionSchemas } from '#validators/dimension'

export const createFileTypeSchema = vine.object({
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  name: vine.string(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const createFileTypeValidator = vine.compile(createFileTypeSchema)

export const createFileTypeArrayValidator = vine.compile(vine.array(createFileTypeSchema))

export const updateFileTypeSchema = vine.object({
  key: vine.string().trim().regex(TYPE_KEY_PATTERN).minLength(3).optional(),
  name: vine.string().optional(),
  dimensionSchemas: dimensionSchemas.optional(),
  tags: vine.array(vine.string().trim()).optional(),
})

export const updateFileTypeValidator = vine.compile(updateFileTypeSchema)
