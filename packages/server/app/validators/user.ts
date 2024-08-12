import vine from '@vinejs/vine'
import { passwordValidation } from '#validators/auth'

/**
 * Validates the role's create action
 */
export const createUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: passwordValidation,
    roleId: vine.string().trim().uuid(),
  })
)

/**
 * Validates the role's update action
 */
export const updateUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)
