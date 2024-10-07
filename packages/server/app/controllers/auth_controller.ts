import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator, resetPasswordValidator, setPasswordValidator } from '#validators/auth'
import User from '#models/user'
// import Role from '#models/role'
import { throwCustomHttpError } from '#exceptions/handler_helper'
import { paramsEmailValidator } from '#validators/email'
import mail from '@adonisjs/mail/services/main'
// import Person from '#models/person'
// import PersonType from '#models/person_type'

export default class AuthController {
  /**
   * Registers a new guest user.
   */
  // async register({ request }: HttpContext) {
  //   const data = await request.validateUsing(registerValidator)

  //   //TODO: For now, this only adds Guest roles, change to the actual requirements
  //   const role = await Role.findBy({ name: 'Guest' })
  //   if (!role) {
  //     throwCustomHttpError(
  //       {
  //         title: 'Missing guest role',
  //         code: 'E_AUTHORIZATION_FAILURE',
  //         detail: 'Unable to register new user with guest role because none exists',
  //       },
  //       500
  //     )
  //     return // TODO: required since typescript doesn't believe that the above function throws an exception
  //   }

  //   // TDOD: For now, only adds temp persontype
  //   const persontype = await PersonType.findBy('key', 'Temp')
  //   if (!persontype) {
  //     throwCustomHttpError(
  //       {
  //         title: 'Missing temp person type',
  //         code: 'E_AUTHORIZATION_FAILURE',
  //         detail: 'Unable to register new user with temp person type because none exists',
  //       },
  //       500
  //     )
  //     return
  //   }

  //   // check if a personId was provided
  //   const personId = request.only(['personId'])
  //   let newUser
  //   if (personId.personId !== null) {
  //     newUser = await User.create({ ...data })
  //   } else {
  //     const personInfo = request.only(['familyName', 'givenName'])
  //     const newPerson = await Person.create({ ...personInfo, personTypeId: persontype.id })
  //     // const person = Person.firstOrCreate(personInfo)

  //     const userInfo = request.only(['email', 'password'])
  //     newUser = await User.create({ ...userInfo, personId: newPerson.id, roleId: role.id })
  //   }

  //   const token = await User.accessTokens.create(newUser, ['*'], {
  //     expiresIn: '30 days',
  //   })

  //   return {
  //     data: {
  //       token: {
  //         type: 'bearer',
  //         value: token.value!.release(),
  //         expiresAt: token.expiresAt,
  //       },
  //       user: newUser.serialize(),
  //     },
  //   }
  // }

  /**
   * @login
   * @summary Login
   * @description Accepts user credentials and attempts to login to this Arcwell instance.
   */
  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(email, password)

    const token = await User.accessTokens.create(user, ['*'], {
      expiresIn: '7 days',
    })

    user.passwordResetCode = null
    user.save()

    return {
      data: {
        token: {
          type: 'bearer',
          value: token.value!.release(),
          expiresAt: token.expiresAt,
        },
        user: user.serialize(),
      },
    }
  }

  /**
   * @logout
   * @summary Logout
   * @description Invalidates active access token and effectively logs out the calling user.
   */
  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    response.status(204).send('')
  }

  /**
   * @me
   * @summary Me
   * @description Convenience method to return the authenticated user's User record.
   */
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
      data: auth.user.serialize(),
    }
  }

  /**
   * @sendForgotPasswordMessage
   * @summary Forgot Password
   * @description Sends email to user upon request to start a password reset workflow.
   */
  async sendForgotPasswordMessage({ request }: HttpContext) {
    await request.validateUsing(paramsEmailValidator)
    const cleanrequest = request.only(['email'])

    const user = await User.findBy('email', cleanrequest.email)
    if (user) {
      User.generateResetCode(user)

      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Arcwell Password Reset')
          .htmlView('emails/password_reset', { user })
      })
    } else {
      return
    }
  }

  /**
   * @resetPassword
   * @summary Reset Password
   * @description Resets a user's password.
   */
  async resetPassword({ request }: HttpContext) {
    await request.validateUsing(resetPasswordValidator)
    const cleanrequest = request.only(['code', 'password'])

    const user = await User.findByOrFail('passwordResetCode', cleanrequest.code)
    user.password = cleanrequest.password
    user.passwordResetCode = null

    await user.save()

    mail.send((message) => {
      message
        .to(user.email)
        .subject('Your Password Has Been Changed')
        .htmlView('emails/password_changed', { user })
    })

    return { data: user }
  }

  /**
   * @changePassword
   * @summary Change Password
   * @description Processes a user's attempt to change their password.
   */
  async changePassword({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(loginValidator)
    const cleanRequest = request.only(['email', 'password', 'newPassword'])
    const user = await User.verifyCredentials(cleanRequest.email, cleanRequest.password)

    user.password = cleanRequest.newPassword
    await user.save()

    mail.send((message) => {
      message
        .to(user.email)
        .subject('Your Password Has Been Changed')
        .htmlView('emails/password_changed', { user })
    })

    return { data: user }
  }

  /**
   * @setPassword
   * @summary Set Password
   * @description Sets a users password only when the user entry has a temp password set.  This is exclusively used by the invite system.
   */
  async setPassword({ request, auth }: HttpContext) {
    await request.validateUsing(setPasswordValidator)
    const cleanRequest = request.only(['tempPassword', 'password', 'email'])

    let user = await User.findByOrFail('email', cleanRequest.email)
    if (user?.requiresPasswordChange && user.tempPassword === cleanRequest.tempPassword) {
      // set the password
      user.password = cleanRequest.password
      await user.save()

      mail.send((message) => {
        message.to(user.email).subject('Your Password Has Been Set').htmlView('emails/password_set')
      })

      return { data: user }
    } else {
      // TODO: what of anything should be done if the user is not in teh system or the require
      // password change is false or the temp passwords dont match
      return
    }
  }
}
