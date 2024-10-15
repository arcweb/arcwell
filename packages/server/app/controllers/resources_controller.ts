import Resource from '#models/resource'
import ResourceType from '#models/resource_type'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceValidator, updateResourceValidator } from '#validators/resource'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildResourcesSort } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import ResourceService from '#services/resource_service'
import { ExtractScopes } from '@adonisjs/lucid/types/model'

export default class ResourcesController {
  /**
   * @count
   * @summary Count People
   * @description Returns the count of total people
   */
  async count({ }: HttpContext) {
    const countQuery = db.from('resources').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Resources
   * @description Returns a list of Resources defined within Arcwell
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const typeKey = queryData['typeKey']

    let [query, countQuery] = buildApiQuery(Resource.query(), queryData, 'resources', 'name')

    query.apply((scopes: ExtractScopes<typeof Resource>) => scopes.fullResource())

    if (typeKey) {
      const resourceType = await ResourceType.findByOrFail('key', typeKey)
      query.where('typeKey', resourceType.key)
      countQuery.where('type_key', resourceType.key)
    }
    buildResourcesSort(query, queryData)

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
   * @summary Create Resource
   * @description Create a new Resource within Arcwell
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createResourceValidator)

    return db.transaction(async (trx) => {
      const newResource = await ResourceService.createResource(trx, request.body())
      return { data: await ResourceService.getFullResource(newResource.id) }
    })
  }

  /**
   * @show
   * @summary Get Resource
   * @description Retrieve details of an individual Resource within Arcwell
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await Resource.query()
        .where('id', params.id)
        .withScopes((scopes) => scopes.fullResource())
        .firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update Resource
   * @description Update an existing Resource within Arcwell
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateResourceValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name', 'typeKey', 'tags'])

    return db.transaction(async (trx) => {
      const updatedResource = await ResourceService.updateResource(trx, params.id, cleanRequest)
      return { data: await ResourceService.getFullResource(updatedResource.id) }
    })
  }

  /**
   * @destroy
   * @summary Delete Resource
   * @description Remove an individual Resource from this Arcwell instance
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const resource = await Resource.findOrFail(params.id)
    await resource.delete()
    response.status(204).send('')
  }
}
