import PersonType from '#models/person_type'
import { paramsUUIDValidator } from '#validators/common'
import { createPersonTypeValidator, updatePersonTypeValidator } from '#validators/person_type'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PersonTypesController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('person_types')

    let query = PersonType.query().preload('tags').orderBy('name', 'asc')

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
    await request.validateUsing(createPersonTypeValidator)
    const newPersonType = await PersonType.create(request.body())
    // TODO: Forced to get the object because create didn't return tags & info.  Because I didn't pass them in?
    const fullPersonType = await PersonType.query()
      .preload('tags')
      .preload('people', (people) => people.preload('tags'))
      .where('id', newPersonType.id)
      .firstOrFail()
    return { data: fullPersonType }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await PersonType.query().preload('tags').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Show record with related people
   */
  async showWithPeople({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
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
    await paramsUUIDValidator.validate(params)
    const personType = await PersonType.findOrFail(params.id)
    const updatedPersonType = await personType.merge(request.body()).save()

    let returnQuery = PersonType.query()
      .preload('tags')
      .preload('people', (people) => people.preload('tags'))
      .where('id', updatedPersonType.id)
      .firstOrFail()

    return { data: await returnQuery }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const personType = await PersonType.findOrFail(params.id)
    await personType.delete()
    response.status(204).send('')
  }
}
