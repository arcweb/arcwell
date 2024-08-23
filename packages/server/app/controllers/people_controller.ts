import Person from '#models/person'
import { paramsUUIDValidator } from '#validators/common'
import { createPersonValidator, updatePersonValidator } from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PeopleController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const personTypeId = queryData['personTypeId']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('people')

    let query = Person.query()
      .orderBy('familyName', 'asc')
      .orderBy('givenName', 'asc')
      .preload('user')
      .preload('personType')

    if (personTypeId) {
      query.where('personTypeId', personTypeId)
      // DB context use sql column names
      countQuery.where('person_type_id', personTypeId)
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
    await request.validateUsing(createPersonValidator)
    const newPerson = await Person.create(request.body())
    return { data: newPerson }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
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
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['givenName', 'familyName', 'personTypeId', 'tags'])
    const person = await Person.findOrFail(params.id)
    const updatedPerson = await person.merge(cleanRequest).save()
    return { data: updatedPerson }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const person = await Person.findOrFail(params.id)
    await person.delete()
    response.status(204).send('')
  }
}
