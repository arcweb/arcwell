import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'
import { paramsUUIDValidator } from '#validators/common'

export default class RolesController {
  /**
   * Display a list of resource
   */
  async index({ auth, request }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let query = Role.query().orderBy('name', 'asc').preload('users')

    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
    }

    return { data: await query }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    return { data: await Role.findOrFail(params.id) }
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, auth, response }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createRoleValidator)
    const newRole = await Role.create(request.body())

    let returnQuery = Role.query()
      .where('id', newRole.id)
      .preload('users', (users) => users.preload('person').preload('tags'))
      .firstOrFail()
    return { data: await returnQuery }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateRoleValidator)
    await paramsUUIDValidator.validate(params)
    const role = await Role.findOrFail(params.id)
    const cleanRequest = request.only(['name'])
    const updateRole = await role.merge(cleanRequest).save()

    let returnQuery = Role.query()
      .where('id', updateRole.id)
      .preload('users', (users) => users.preload('person').preload('tags'))
      .firstOrFail()
    return { data: await returnQuery }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const role = await Role.findOrFail(params.id)
    await role.delete()
    response.status(204).send('')
  }
}
