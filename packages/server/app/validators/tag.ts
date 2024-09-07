import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createTagValidator = vine.compile(
  vine.object({
    pathname: vine.string().trim(),
  })
)

/**
 * Validates the person's update action
 */
export const updateTagValidator = vine.compile(vine.object({}))

/**
 * Validates the person's set tags action
 */
export const setTagsValidator = vine.compile(
  vine.object({
    objectType: vine.string(),
    tags: vine.array(vine.string()),
  })
)
