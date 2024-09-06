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
      'activities',
      'activity_types',
      'cohorts',
      'events',
      'event_types',
      'facts',
      'fact_types',
      'people',
      'person_types',
      'resources',
      'resource_types',
      'users',
    ]),
    tags: vine.array(vine.string()),
  })
)
