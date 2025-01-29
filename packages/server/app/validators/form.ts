import vine from '@vinejs/vine'

export const sectionSchema = vine.object({
  type: vine.string(),
  value: vine.string(),
  order: vine.number(),
})

export const sections = vine.array(sectionSchema).minLength(1)

/**
 * Validates the Form's create action
 */
export const createFormSchema = vine.object({
  name: vine.string().trim(),
  tags: vine.array(vine.string().optional()).optional(),
  sections: sections,
})

export const createFormValidator = vine.compile(createFormSchema)

/**
 * Validates the Form's update action
 */
export const updateFormSchema = vine.object({
  name: vine.string().trim().optional(),
  sections: sections,
  tags: vine.array(vine.string().optional()).optional(),
})

export const updateFormValidator = vine.compile(updateFormSchema)
