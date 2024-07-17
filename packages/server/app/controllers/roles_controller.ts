import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'

export default class RolesController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    const roles = await Role.all()
    return {
      status: 'success',
      data: {
        roles: roles,
      },
    }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)
      return { status: 'success', data: role }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    try {
      await request.validateUsing(createRoleValidator)
      const role = await Role.create(request.body())
      return {
        status: 'success',
        data: {
          role: role,
        },
      }
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
      const role = await Role.findOrFail(params.id)
      // TODO: If you pass in an id in request.body(), it will be ignored, but the updatedRole will have that id, but it wasn't updated in the database
      // TODO: Figure out a better way besides merge.
      const updateRole = await role.merge(request.body()).save()
      return { status: 'success', data: updateRole }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)
      await role.delete()
      return { status: 'success', data: role }
    } catch (error) {
      return { status: 'error', message: error }
    }
  }
}
