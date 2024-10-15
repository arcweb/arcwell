import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'
import { paramsUUIDValidator } from '#validators/common'
import { buildApiQuery } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import RoleService from '#services/role_service'

export default class RolesController {
  /**
   * @index
   * @summary List Roles
   * @description Returns a list of Roles defined within Arcwell
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    let [query, countQuery] = buildApiQuery(Role.query(), queryData, 'roles')

    query.orderBy('name', 'asc').preload('users')

    const queryCount = await countQuery.count('*')

    return {
      data: await query,
      meta: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @show
   * @summary Get Role
   * @description Retrieve details on an individual Role within Arcwell
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return { data: await Role.findOrFail(params.id) }
  }

  /**
   * @store
   * @summary Create Role
   * @description Create a new Role within Arcwell
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createRoleValidator)

    return await db.transaction(async (trx) => {
      const newRole = await RoleService.createRole(trx, request.body())
      return { data: await RoleService.getFullRole(newRole.id, trx) }
    })
  }

  /**
   * @update
   * @summary Update Role
   * @description Update the details of an existing Role within Arcwell
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateRoleValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name'])

    return await db.transaction(async (trx) => {
      const updatedRole = await RoleService.updateRole(trx, params.id, cleanRequest)
      return { data: await RoleService.getFullRole(updatedRole.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Role
   * @description Remove a specific Role from this instance of Arcwell
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const role = await Role.findOrFail(params.id)
    await role.delete()
    response.status(204).send('')
  }
}
