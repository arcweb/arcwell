import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)

    /**
     * Now login the user or create a token for them
     */
    const token = await User.accessTokens.create(user)
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
  }
}
