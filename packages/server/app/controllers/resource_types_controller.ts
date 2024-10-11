import { buildApiQuery, setTagsForObject } from '#helpers/query_builder'
import ResourceType from '#models/resource_type'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceTypeValidator, updateResourceTypeValidator } from '#validators/resource_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullResourceType(id: string) {
  return ResourceType.query().preload('tags').where('id', id).firstOrFail()
}

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
    let newResourceType = null
    await db.transaction(async (trx) => {
      newResourceType = new ResourceType().fill(request.body()).useTransaction(trx)
      await newResourceType.save()

      const tags = request.only(['tags'])
      if (tags.tags && tags.tags.length > 0) {
        await setTagsForObject(trx, newResourceType.id, 'resource_types', tags.tags, false)
      }
    })

    return { data: await getFullResourceType(newResourceType.id) }
  }

  /**
   * @show
   * @summary Get Resource Type
   * @description Retrieve an individual ResourceType definition
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await ResourceType.query().preload('tags').where('id', params.id).firstOrFail(),
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
    let updatedResourceType = null
    await db.transaction(async (trx) => {
      const resourceType = await ResourceType.findOrFail(params.id)
      resourceType.useTransaction(trx)
      updatedResourceType = await resourceType.merge(request.body()).save()

      const tags = request.only(['tags'])
      if (tags.tags) {
        await setTagsForObject(trx, resourceType.id, 'resource_types', tags.tags)
      }
    })

    return { data: await getFullResourceType(updatedResourceType.id) }
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
