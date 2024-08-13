import PersonType from '#models/person_type'
import { createPersonTypeValidator, updatePersonTypeValidator } from '#validators/person_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class PersonTypesController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return { data: await PersonType.query() }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createPersonTypeValidator)
    const newPersonType = await PersonType.create(request.body())
    return { data: newPersonType }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await PersonType.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Show record with related people
   */
  async showWithPeople({ params }: HttpContext) {
    return {
      data: await PersonType.query().preload('people').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updatePersonTypeValidator)
    const personType = await PersonType.findOrFail(params.id)
    const updatedpersonType = await personType.merge(request.body()).save()
    return { data: updatedpersonType }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const personType = await PersonType.findOrFail(params.id)
    await personType.delete()
    response.status(204).send('')
  }
}
