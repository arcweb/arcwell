import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    await auth.authenticate()
    return { date: await Role.all() }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    return { date: await Role.findOrFail(params.id) }
  }

  /**
   * Handle form submission for the creation action
   */
  async store({ request, auth, response }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createRoleValidator)
    const newRole = await Role.create(request.body())
    response.status(201).send({ data: newRole })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateRoleValidator)
    const role = await Role.findOrFail(params.id)
    const cleanRequest = request.only(['name'])
    const updateRole = await role.merge(cleanRequest).save()
    return { data: updateRole }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const role = await Role.findOrFail(params.id)
    await role.delete()
    response.status(204).send('')
  }
}
