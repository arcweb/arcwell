import Person from '#models/person'
import { createPersonValidator, updatePersonValidator } from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'

export default class PeopleController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return { data: await Person.query().preload('user').preload('type') }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth, response }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createPersonValidator)
    const newPerson = await Person.create(request.body())
    return { data: newPerson }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await Person.query()
        .where('id', params.id)
        .preload('user')
        .preload('type')
        .firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updatePersonValidator)
    const cleanRequest = request.only(['givenName', 'familyName'])
    const person = await Person.findOrFail(params.id)
    const updatedPerson = await person.merge(cleanRequest).save()
    return { data: updatedPerson }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const person = await Person.findOrFail(params.id)
    await person.delete()
    response.status(204).send('')
  }
}
