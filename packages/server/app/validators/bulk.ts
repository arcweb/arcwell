import vine from '@vinejs/vine'

export const bulkUploadSchema = vine.object({
  file: vine.file({
    extnames: ['csv'],
  }),
  typeKey: vine.string().trim(),
})

export const bulkUploadValidator = vine.compile(bulkUploadSchema)
