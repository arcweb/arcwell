import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, registerValidator } from '#validators/auth'
import User from '#models/user'
import Role from '#models/role'
import { throwCustomHttpError } from '#exceptions/handler_helper'

export default class AuthController {
  /**
   * Registers a new guest user.
   */
  async register({ request }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const role = await Role.findBy({ name: 'Guest' })
    if (!role) {
      throwCustomHttpError(
        {
          title: 'Missing guest role',
          code: 'E_AUTHORIZATION_FAILURE',
          detail: 'Unable to register new user as guest role',
        },
        500
      )
      return // TODO: required since typescript doesn't know that the above function throws an exception and won't continue
    }
    const user = await User.create({ ...data, roleId: role.id })

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '30 days',
    })

    return {
      data: {
        token: {
          type: 'bearer',
          value: token.value!.release(),
          expiresAt: token.expiresAt,
        },
        user,
      },
    }
  }

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '7 days',
    })

    return {
      data: {
        type: 'bearer',
        value: token.value!.release(),
        expiresAt: token.expiresAt,
      },
    }
  }

  async logout({ auth }: HttpContext) {
    try {
      const user = auth.user!
      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return {}
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
