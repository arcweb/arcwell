import Resource from '#models/resource'
import { createResourceValidator, updateResourceValidator } from '#validators/resource'
import type { HttpContext } from '@adonisjs/core/http'

export default class ResourcesController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const resourceTypeId = queryData['resourceTypeId']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let query = Resource.query().preload('resourceType')

    if (resourceTypeId) {
      query.where('resourceTypeId', resourceTypeId)
    }
    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
    }

    return {
      data: await query,
    }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createResourceValidator)
    const newResource = await Resource.create(request.body())
    return { data: newResource }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await Resource.query().where('id', params.id).preload('resourceType').firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateResourceValidator)
    const cleanRequest = request.only(['name'])
    const resource = await Resource.findOrFail(params.id)
    const updatedResource = await resource.merge(cleanRequest).save()
    return { data: updatedResource }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const resource = await Resource.findOrFail(params.id)
    await resource.delete()
    response.status(204).send('')
  }
}
