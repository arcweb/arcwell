import vine from "@vinejs/vine";

export const bulkUploadSchema = vine.object({
  file: vine.file({
    extnames: ['csv']
  })
})

export const bulkUploadValidator = vine.compile(bulkUploadSchema)
