import Person from '#models/person'
import PersonType from '#models/person_type'
import { paramsUUIDValidator } from '#validators/common'
import { createPersonValidator, updatePersonValidator, cohortIdsValidator } from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

export function getFullPerson(
  id: string,
  cohortLimit: number = 10,
  cohortOffset: number = 0,
) {
  return Person.query()
    .where('id', id)
    .preload('tags')
    .preload('user', (user) => {
      user.preload('tags')
    })
    .preload('personType', (personType) => {
      personType.preload('tags')
    })
    .withCount('cohorts')
    .preload('cohorts', (cohorts) => {
      cohorts.limit(cohortLimit)
      cohorts.offset(cohortOffset)
      cohorts.preload('tags')
      cohorts.orderBy('name', 'asc')
    })
    .firstOrFail()
}

export default class PeopleController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()

    const queryData = request.qs()

    const search = queryData['search']
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const sort = queryData['sort']
    const order = queryData['order']
    const notInCohort = queryData['notInCohort']

    let countQuery = db.from('people')

    let query = Person.query()
      .preload('tags')
      .preload('user', (user) => {
        user.preload('tags')
      })
      .preload('personType', (personType) => {
        personType.preload('tags')
      })

    // Add search functionality to query
    if (typeof search === 'string') {
      query.whereILike('familyName', search)
      countQuery.whereILike('familyName', search)
    } else if (typeof search === 'object' && search !== null) {
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          const searchString = '%' + search[key] + '%'
          query.whereILike(string.camelCase(key), searchString)
          countQuery.whereILike(string.snakeCase(key), searchString)
        }
      }
    }

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
    if (notInCohort) {
      // Get complete list of people ids associated with cohort to filter them out
      // in add person to cohort form
      const peopleIdInCohortQuery = await db
        .from('people')
        .select('id')
        .whereIn('id', db.from('cohort_person').select('person_id').where('cohort_id', notInCohort))
      const idList = peopleIdInCohortQuery.map((id) => id['id'])
      query.whereNotIn('id', idList)
    }
    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      if (camelSortStr === 'personType') {
        query
          .join('person_types', 'person_types.key', 'people.type_key')
          .orderBy('person_types.name', order)
      } else {
        query.orderBy(camelSortStr, order)
      }
    } else {
      query.orderBy('familyName', 'asc')
      query.orderBy('givenName', 'asc')
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
   * Show individual record with cohorts
   */
  async showWithCohorts({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    const queryData = request.qs()
    const cohortLimit = (queryData['cohortLimit'] ||= 10)
    const cohortOffset = (queryData['cohortOffset'] ||= 0)

    return {
      data: await getFullPerson(params.id, cohortLimit, cohortOffset),
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

  /**
   * Assign Cohort to Person
   */
  async attachCohort({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(cohortIdsValidator)
    const cleanRequest = request.only(['cohortIds'])
    const person = await Person.findOrFail(params.id)

    await person.related('cohorts').attach(cleanRequest.cohortIds)

    response.status(201).send('')
  }

  /**
   * Unassign Cohort from Person
   */
  async detachCohort({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(cohortIdsValidator)
    const cleanRequest = request.only(['cohortIds'])
    const person = await Person.findOrFail(params.id)

    await person.related('cohorts').detach(cleanRequest.cohortIds)

    response.status(204).send('')
  }
}
