import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
import Role from '#models/role'

export default class AuthController {
  /**
   * Registers a new guest user.
   */
  async register({ request }: HttpContext) {
    try {
      const data = await request.validateUsing(registerValidator)
      const role = await Role.findBy({ name: 'Guest' })
      if (!role) {
        return { status: 'error', message: 'Missing guest role.  Unable to register new user' }
      }
      const user = await User.create({ ...data, roleId: role.id })

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      return {
        status: 'success',
        data: {
          token: {
            type: 'bearer',
            value: token.value!.release(),
            expiresAt: token.expiresAt,
          },
        },
      }
    } catch (error) {
      return {
        status: 'error',
        message: error,
      }
    }
  }

  async login({ request }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(loginValidator)
      const user = await User.verifyCredentials(email, password)

      const token = await User.accessTokens.create(user, ['*'], {
        expiresIn: '30 days',
      })

      return {
        status: 'success',
        data: {
          token: {
            type: 'bearer',
            value: token.value!.release(),
            expiresAt: token.expiresAt,
          },
        },
      }
    } catch (error) {
      return {
        status: 'error',
        message: error,
      }
    }
  }

  async logout({ auth }: HttpContext) {
    try {
      const user = auth.user!
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return {
        status: 'success',
      }
    } catch (error) {
      return {
        status: 'error',
        message: error,
      }
    }
  }

  async me({ auth }: HttpContext) {
    try {
      await auth.check()

      if (!auth.user) {
        return {
          status: 'error',
          message: 'User token is invalid',
        }
      }

      return {
        status: 'success',
        data: {
          user: auth.user,
        },
      }
    } catch (error) {
      return {
        status: 'error',
        message: error,
      }
    }
  }
}
