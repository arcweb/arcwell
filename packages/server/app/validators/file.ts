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

export const fileDownloadSchema = vine.object({
  fileName: vine.string().trim(),
})

export const fileDownloadValidator = vine.compile(fileDownloadSchema)
