import ResourceType from '#models/resource_type'
import { createResourceTypeValidator } from '#validators/resource_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class ResourceTypesController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return { data: await ResourceType.query() }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createResourceTypeValidator)
    const newResourceType = await ResourceType.create(request.body())
    return { data: newResourceType }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await ResourceType.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createResourceTypeValidator)
    const resourceType = await ResourceType.findOrFail(params.id)
    const updatedResourceType = await resourceType.merge(request.body()).save()
    return { data: updatedResourceType }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const resourceType = await ResourceType.findOrFail(params.id)
    await resourceType.delete()
    response.status(204).send('')
  }
}
