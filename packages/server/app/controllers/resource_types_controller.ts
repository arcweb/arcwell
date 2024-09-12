import ResourceType from '#models/resource_type'
import { paramsUUIDValidator } from '#validators/common'
import { createResourceTypeValidator, updateResourceTypeValidator } from '#validators/resource_type'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullResourceType(id: string) {
  return ResourceType.query()
    .preload('tags')
    .preload('resources', (resources) => resources.preload('tags'))
    .where('id', id)
    .firstOrFail()
}

export default class ResourceTypesController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('resource_types')

    let query = ResourceType.query().preload('tags').orderBy('name', 'asc')

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
    await request.validateUsing(createResourceTypeValidator)
    const newResourceType = await ResourceType.create(request.body())

    return { data: await getFullResourceType(newResourceType.id) }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await ResourceType.query().preload('tags').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * SHow record with related resources
   */
  async showWithResources({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await ResourceType.query().preload('resources').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateResourceTypeValidator)
    await paramsUUIDValidator.validate(params)
    const resourceType = await ResourceType.findOrFail(params.id)
    const updatedResourceType = await resourceType.merge(request.body()).save()

    return { data: await getFullResourceType(updatedResourceType.id) }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const resourceType = await ResourceType.findOrFail(params.id)
    await resourceType.delete()
    response.status(204).send('')
  }
}
