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

    //TODO: For now, this only adds Guest roles, change to the actual requirements
    const role = await Role.findBy({ name: 'Guest' })
    if (!role) {
      throwCustomHttpError(
        {
          title: 'Missing guest role',
          code: 'E_AUTHORIZATION_FAILURE',
          detail: 'Unable to register new user with guest role because none exists',
        },
        500
      )
      return // TODO: required since typescript doesn't believe that the above function throws an exception
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

  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    response.status(204).send('')
  }

  async me({ auth }: HttpContext) {
    await auth.check()

    if (!auth.user) {
      throwCustomHttpError(
        {
          title: 'User token is invalid',
          code: 'E_INVALID_TOKEN',
        },
        401
      )
      return // TODO: This feels like it shouldn't be needed, but confirm
    }

    return {
      data: auth.user,
    }
  }
}
