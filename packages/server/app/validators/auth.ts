import vine from '@vinejs/vine'

//TODO: Improve this with actual password rule validation
export const passwordValidation = vine.string().minLength(8)

export const registerValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .email()
      .normalizeEmail()
      .unique(async (db, value) => {
        const match = await db.from('users').select('id').where('email', value).first()
        return !match
      }),
    password: passwordValidation,
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: passwordValidation,
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    code: vine.string(),
    password: passwordValidation,
  })
)
