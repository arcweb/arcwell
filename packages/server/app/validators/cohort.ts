import vine from '@vinejs/vine'

/**
 * Validates the cohort's create action
 */
export const createCohortValidator = vine.compile(
  vine.object({
    name: vine.string().trim(),
    description: vine.string().trim().optional(),
    rules: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the cohort's update action
 */
export const updateCohortValidator = vine.compile(
  vine.object({
    id: vine.string().trim().uuid(),
    name: vine.string().trim().optional(),
    description: vine.string().trim().optional(),
    rules: vine.object({}).allowUnknownProperties().optional(),
    tags: vine.array(vine.string().trim()).optional(),
  })
)

/**
 * Validates the people ids for the cohort's attachPeople, detachPeople and setPeople action
 */
export const peopleIdsValidator = vine.compile(
  vine.object({ peopleIds: vine.array(vine.string().uuid()).distinct() })
)
