import vine from '@vinejs/vine'

export const bulkUploadSchema = vine.object({
  file: vine.file({
    extnames: ['csv'],
  }),
  typeKey: vine.string().trim(),
})

export const bulkUploadValidator = vine.compile(bulkUploadSchema)

export const fileUploadSchema = vine.object({
  file: vine.file({
    extnames: ['txt', 'png', 'svg', 'jpeg'],
  }),
})

export const fileUploadValidator = vine.compile(fileUploadSchema)

export const fileAccessSchema = vine.object({
  fileName: vine.string().trim(),
})

export const fileAccessValidator = vine.compile(fileAccessSchema)
