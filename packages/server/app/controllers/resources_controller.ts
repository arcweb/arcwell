import Resource from '#models/resource'
import ResourceType from '#models/resource_type'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceValidator, updateResourceValidator } from '#validators/resource'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullResource(id: string) {
  return Resource.query()
    .where('id', id)
    .preload('tags')
    .preload('facts')
    .preload('resourceType', (resourceType) => resourceType.preload('tags'))
    .firstOrFail()
}

export default class ResourcesController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('resources')

    let query = Resource.query()
      .preload('resourceType', (resourceType) => {
        resourceType.preload('tags')
      })
      .preload('tags')
      .orderBy('name', 'asc')

    if (typeKey) {
      const resourceType = await ResourceType.findByOrFail('key', typeKey)
      query.where('typeKey', resourceType.key)
      countQuery.where('type_key', resourceType.key)
    }
    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
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
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createResourceValidator)
    const newResource = await Resource.create(request.body())

    return { data: await getFullResource(newResource.id) }
  }

  /**
   * Show individual record
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
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateResourceValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['name', 'typeKey'])
    const resource = await Resource.findOrFail(params.id)
    const updatedResource = await resource.merge(cleanRequest).save()
    return { data: await getFullResource(updatedResource.id) }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const resource = await Resource.findOrFail(params.id)
    await resource.delete()
    response.status(204).send('')
  }
}
