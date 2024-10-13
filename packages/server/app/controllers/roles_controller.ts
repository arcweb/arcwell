import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/role'
import { createRoleValidator, updateRoleValidator } from '#validators/role'
import { paramsUUIDValidator } from '#validators/common'
import { buildApiQuery } from '#helpers/query_builder'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'
import db from '@adonisjs/lucid/services/db'

export function getFullRole(id: string, trx?: TransactionClientContract) {
  if (trx) {
    return Role.query({ client: trx })
      .where('id', id)
      .preload('users', (users) => users.preload('person').preload('tags'))
      .firstOrFail()
  } else {
    return Role.query()
      .where('id', id)
      .preload('users', (users) => users.preload('person').preload('tags'))
      .firstOrFail()
  }
}

export const createRole = async (trx: TransactionClientContract, createData: any) => {
  const newRole = new Role().fill(createData).useTransaction(trx)
  await newRole.save()

  return newRole
}

export const updateRole = async (trx: TransactionClientContract, id: string, updateData: any) => {
  const role = await Role.findOrFail(id)
  role.useTransaction(trx)
  const updatedRole = await role.merge(updateData).save()

  return updatedRole
}

export default class RolesController {
  /**
   * @index
   * @summary List Roles
   * @description Returns a list of Roles defined within Arcwell
   * @paramUse(sortable, filterable)
   */
  async index({ auth, request }: HttpContext) {
    await auth.authenticate()
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
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    return { data: await Role.findOrFail(params.id) }
  }

  /**
   * @store
   * @summary Create Role
   * @description Create a new Role within Arcwell
   */
  async store({ auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createRoleValidator)

    return await db.transaction(async (trx) => {
      const newRole = await createRole(trx, request.body())
      return { data: await getFullRole(newRole.id, trx) }
    })
  }

  /**
   * @update
   * @summary Update Role
   * @description Update the details of an existing Role within Arcwell
   */
  async update({ params, auth, request }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateRoleValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name'])

    return await db.transaction(async (trx) => {
      const updatedRole = await updateRole(trx, params.id, cleanRequest)
      return { data: await getFullRole(updatedRole.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Role
   * @description Remove a specific Role from this instance of Arcwell
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const role = await Role.findOrFail(params.id)
    await role.delete()
    response.status(204).send('')
  }
}
