import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createRoleValidator, updateRoleValidator } from '#validators/role'
import string from '@adonisjs/core/helpers/string'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    // const users = await User.all()

    const testStt = 'policies'
    console.log('singular->??:???', string.singular(testStt))

    const users = await User.query().preload('role')
    return {
      status: 'success',
      data: {
        users: users,
      },
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    try {
      // Check that a valid Bearer token was passed in the header
      await auth.authenticate()
      await request.validateUsing(createRoleValidator)
      const user = await User.create(request.body())
      return {
        status: 'success',
        data: {
          user: user,
        },
      }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }
  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    try {
      // TODO: Handle an invalid uuid with a better message
      const user = await User.query().where('id', params.id).preload('role')
      if (user.length <= 0) {
        return { status: 'error', data: { message: 'No user found.' } }
      }
      // console.log('user: ', user[0])
      return { status: 'success', data: { user: user } }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    try {
      await request.validateUsing(updateRoleValidator)
      const user = await User.findOrFail(params.id)
      // TODO: If you pass in an id in request.body(), it will be ignored, but the updatedRole will have that id, but it wasn't updated in the database
      // TODO: Figure out a better way besides merge.
      const updatedUser = await user.merge(request.body()).save()
      return { status: 'success', data: { user: updatedUser } }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      await user.delete()
      return { status: 'success' }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }
}
