import Resource from '#models/resource'
import ResourceType from '#models/resource_type'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceValidator, updateResourceValidator } from '#validators/resource'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildResourcesSort, setTagsForObject } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'

export function getFullResource(id: string) {
  return Resource.query()
    .where('id', id)
    .preload('tags')
    .preload('resourceType', (resourceType) => resourceType.preload('tags'))
    .firstOrFail()
}

export default class ResourcesController {
  /**
   * @count
   * @summary Count People
   * @description Returns the count of total people
   */
  async count({ auth }: HttpContext) {
    await auth.authenticate()

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

    query
      .preload('resourceType', (resourceType: any) => {
        resourceType.preload('tags')
      })
      .preload('tags')

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
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createResourceValidator)
    let newResource = null;
    await db.transaction(async (trx) => {
      newResource = await Resource.create(request.body(), trx)

      const tags = request.only(['tags'])
      if (tags.tags && tags.tags.length > 0) {
        await setTagsForObject(trx, newResource.id, 'resources', tags.tags, false)
      }
    })

    return { data: await getFullResource(newResource.id) }
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
        .preload('resourceType', (resourceType) => {
          resourceType.preload('tags')
        })
        .preload('tags')
        .where('id', params.id)
        .preload('resourceType')
        .firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update Resource
   * @description Update an existing Resource within Arcwell
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateResourceValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['name', 'typeKey', 'tags'])
    let updatedResource = null
    await db.transaction(async (trx) => {
      const resource = await Resource.findOrFail(params.id)
      resource.useTransaction(trx)
      updatedResource = await resource.merge(cleanRequest).save()

      if (cleanRequest.tags) {
        await setTagsForObject(trx, resource.id, 'resources', cleanRequest.tags)
      }
    })
    return { data: await getFullResource(updatedResource.id) }
  }

  /**
   * @destroy
   * @summary Delete Resource
   * @description Remove an individual Resource from this Arcwell instance
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const resource = await Resource.findOrFail(params.id)
    await resource.delete()
    response.status(204).send('')
  }
}
