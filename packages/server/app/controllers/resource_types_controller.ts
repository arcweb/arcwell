import { buildApiQuery } from '#helpers/query_builder'
import ResourceType from '#models/resource_type'
import ResourceTypeService from '#services/resource_type_service'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceTypeValidator, updateResourceTypeValidator } from '#validators/resource_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ResourceTypesController {
  /**
   * @index
   * @summary List Resource Types
   * @description Retrieve a list of known type definitions for Resource objects
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = buildApiQuery(ResourceType.query(), queryData, 'resource_types')

    query.preload('tags')

    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      query.orderBy(camelSortStr, order)
    } else {
      query.orderBy('name', 'asc')
    }

    const queryCount = await countQuery.count('*')

    return {
      data: await query,
      meta: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @store
   * @summary Create ResourceType
   * @description Create a new type definition and schema for Resource objects in Arcwell
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createResourceTypeValidator)

    return db.transaction(async (trx) => {
      const newResourceType = await ResourceTypeService.createResourceType(
        trx,
        request.body(),
        request.input('tags')
      )
      return { data: await ResourceTypeService.getFullResourceType(newResourceType.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get Resource Type
   * @description Retrieve an individual ResourceType definition
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await ResourceType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * @showWithResources
   * @summary List Resources of Type
   * @description Retrieve a list of Resource objects of the indicated ResourceType
   * @paramUse(sortable, filterable)
   */
  async showWithResources({ params }: HttpContext) {
    console.log('\n\n', params, '\n\n')
    await paramsUUIDValidator.validate(params)
    return {
      data: await ResourceType.query().preload('resources').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update ResourceType
   * @description Update a specific ResourceType definition within Arcwell
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateResourceTypeValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name', 'key', 'description'])

    return await db.transaction(async (trx) => {
      const updatedResourceType = await ResourceTypeService.updateResourceType(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await ResourceTypeService.getFullResourceType(updatedResourceType.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete ResourceType
   * @description Remove a specific ResourceType definition from Arcwell
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const resourceType = await ResourceType.findOrFail(params.id)
    await resourceType.delete()
    response.status(204).send('')
  }
}
