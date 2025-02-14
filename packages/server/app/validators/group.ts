import vine from '@vinejs/vine'

/**
 * Validates the person's create action
 */
export const createGroupSchema = vine.object({
  name: vine.string().trim(),
})

export const createGroupValidator = vine.compile(createGroupSchema)

/**
 * Validates the person's update action
 */
export const updateGroupSchema = vine.object({
  name: vine.string().trim().optional(),
})

export const updateGroupValidator = vine.compile(updateGroupSchema)

/**
 * Validates the person's set groups action
 */
export const setGroupsValidator = vine.compile(
  vine.object({
    objectType: vine.string(),
    groups: vine.array(vine.string()),
  })
)
