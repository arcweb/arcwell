import Person from '#models/person'
import PersonType from '#models/person_type'
import { paramsUUIDValidator } from '#validators/common'
import { createPersonValidator, updatePersonValidator } from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullPerson(id: string) {
  return Person.query()
    .where('id', id)
    .preload('tags')
    .preload('user', (user) => {
      user.preload('tags')
    })
    .preload('personType', (personType) => {
      personType.preload('tags')
    })
    .preload('cohorts', (cohorts) => {
      cohorts.preload('tags')
    })
    .firstOrFail()
}

export default class PeopleController {
  /**
   * @index
   * @tag People
   * @operationId people_list
   * @description Returns a list of People with related information
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()

    const queryData = request.qs()
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('people')

    let query = Person.query()
      .orderBy('familyName', 'asc')
      .orderBy('givenName', 'asc')
      .preload('tags')
      .preload('user', (user) => {
        user.preload('tags')
      })
      .preload('personType', (personType) => {
        personType.preload('tags')
      })

    if (typeKey) {
      const personType = await PersonType.findByOrFail('key', typeKey)
      query.where('typeKey', personType.key)
      // DB context use sql column names
      countQuery.where('type_key', personType.key)
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

    return { data: await getFullPerson(newPerson.id) }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    return {
      data: await Person.query()
        .where('id', params.id)
        .preload('tags')
        .preload('user', (tags) => {
          tags.preload('tags')
        })
        .preload('personType', (tags) => {
          tags.preload('tags')
        })
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
    const cleanRequest = request.only(['givenName', 'familyName', 'typeKey', 'tags'])
    const person = await Person.findOrFail(params.id)
    const updatedPerson = await person.merge(cleanRequest).save()

    return { data: await getFullPerson(updatedPerson.id) }
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
