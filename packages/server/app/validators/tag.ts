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
// TODO: Add other objectType enums and maybe make it more global
export const setTagsValidator = vine.compile(
  vine.object({
    objectType: vine.enum([
      'users',
      'people',
      'events',
      'resources',
      'facts',
      'activity',
      'person_types',
      'event_types',
      'resource_types',
      'fact_types',
      'activity_types',
    ]),
    tags: vine.array(vine.string()),
  })
)
