import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { updateUserValidator } from '#validators/user'
import { throwCustomHttpError } from '#exceptions/handler_helper'

export default class UsersController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    await auth.authenticate()
    return { data: await User.query().preload('role').preload('person') }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    return {
      data: await User.query()
        .where('id', params.id)
        .preload('role')
        .preload('person')
        .firstOrFail(),
    }
  }

  /**
   * Handle form submission for the creation action
   */
  async store({}: HttpContext) {
    // TODO: Add create user functionality back in...
    // await auth.authenticate()
    // await request.validateUsing(createUserValidator)
    // const newUser = User.create(request.body())
    // response.status(201).send({ data: newUser })
    throwCustomHttpError(
      {
        title: 'Wrong Endpoint',
        code: 'E_USER_STORE_FAILURE',
        detail: 'Please use /auth/register to create users',
      },
      400
    )
    return
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateUserValidator)
    const cleanRequest = request.only(['email'])
    const user = await User.findOrFail(params.id)
    const updatedUser = await user.merge(cleanRequest).save()
    return { data: updatedUser }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const user = await User.findOrFail(params.id)
    await user.delete()
    response.status(204).send('')
  }
}
