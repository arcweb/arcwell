import Person from '#models/person'
import { createPersonValidator, updatePersonValidator } from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'

export default class PeopleController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const personTypeId = queryData['personTypeId']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let query = Person.query().preload('user').preload('personType')

    if (personTypeId) {
      query.where('personTypeId', personTypeId)
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
        .preload('personType')
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
