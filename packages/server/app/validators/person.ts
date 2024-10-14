import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createPersonSchema = vine.object({
  familyName: vine.string().trim(),
  givenName: vine.string().trim(),
  typeKey: vine.string().trim(),
})

export const createPersonValidator = vine.compile(createPersonSchema)

/**
 * Validates the person's update action
 */
export const updatePersonSchema = vine.object({
  familyName: vine.string().trim().optional(),
  givenName: vine.string().trim().optional(),
  typeKey: vine.string().trim().optional(),
})

export const updatePersonValidator = vine.compile(updatePersonSchema)

/**
 * Validates the cohort ids for the person's attachCohort and detachCohort actions
 */
export const cohortIdsValidator = vine.compile(
  vine.object({ cohortIds: vine.array(vine.string().uuid()).distinct() })
)
