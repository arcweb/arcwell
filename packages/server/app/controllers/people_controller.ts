import Person from '#models/person'
import PersonType from '#models/person_type'
import { paramsUUIDValidator } from '#validators/common'
import {
  createPersonValidator,
  updatePersonValidator,
  cohortIdsValidator,
} from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'
import string from '@adonisjs/core/helpers/string'
import { buildApiQuery } from '#helpers/query_builder'

export function getFullPerson(id: string, cohortLimit: number = 10, cohortOffset: number = 0) {
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
    console.log('PEOPLE INDEXING')

    const queryData = request.qs()

    const typeKey = queryData['typeKey']
    const sort = queryData['sort']
    const order = queryData['order']
    const notInCohort = queryData['notInCohort']

    let [query, countQuery] = buildApiQuery(Person.query(), queryData, 'people', 'familyName')

    query
      .preload('tags')
      .preload('user', (user: any) => {
        user.preload('tags')
      })
      .preload('personType', (personType: any) => {
        personType.preload('tags')
      })

    if (typeKey) {
      const personType = await PersonType.findByOrFail('key', typeKey)
      query.where('typeKey', personType.key)
      // DB context use sql column names
      countQuery.where('type_key', personType.key)
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
