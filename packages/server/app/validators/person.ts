import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createPersonValidator = vine.compile(
  vine.object({
    familyName: vine.string().trim(),
    givenName: vine.string().trim(),
    typeKey: vine.string().trim(),
  })
)

/**
 * Validates the person's update action
 */
export const updatePersonValidator = vine.compile(vine.object({}))

/**
 * Validates the cohort ids for the person's attachCohort and detachCohort actions
 */
export const cohortIdsValidator = vine.compile(
  vine.object({ cohortIds: vine.array(vine.string().trim().uuid()).distinct() })
)
