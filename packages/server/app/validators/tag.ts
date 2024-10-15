import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createTagSchema = vine.object({
  pathname: vine.string().trim(),
})

export const createTagValidator = vine.compile(createTagSchema)

/**
 * Validates the person's update action
 */
export const updateTagSchema = vine.object({
  pathname: vine.string().trim().optional(),
})

export const updateTagValidator = vine.compile(updateTagSchema)

/**
 * Validates the person's set tags action
 */
export const setTagsValidator = vine.compile(
  vine.object({
    objectType: vine.string(),
    tags: vine.array(vine.string()),
  })
)
