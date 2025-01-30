import vine from '@vinejs/vine'

export const bulkUploadSchema = vine.object({
  file: vine.file({
    extnames: ['csv'],
  }),
  typeKey: vine.string().trim(), // the resource type key
})

export const bulkUploadValidator = vine.compile(bulkUploadSchema)

export const fileUploadSchema = vine.object({
  file: vine.file({
    extnames: ['txt', 'png', 'svg', 'jpeg', 'csv'],
  }),
  typeKey: vine.string().trim(), // the file type key
})

export const fileUploadValidator = vine.compile(fileUploadSchema)

export const fileAccessSchema = vine.object({
  name: vine.string().trim(),
})

export const fileAccessValidator = vine.compile(fileAccessSchema)

export const fileUpdateSchema = vine.object({
  name: vine.string().trim(),
})

export const fileUpdateValidator = vine.compile(fileUpdateSchema)
