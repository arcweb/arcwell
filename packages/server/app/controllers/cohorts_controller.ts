import Cohort from '#models/cohort'
import {
  createCohortValidator,
  peopleIdsValidator,
  updateCohortValidator,
} from '#validators/cohort'
import { paramsUUIDValidator } from '#validators/common'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

export function getFullCohort(
  id: string,
  peopleLimit: number = 10,
  peopleOffset: number = 0,
  peopleSort?: string,
  peopleOrder?: 'asc' | 'desc'
) {
  return Cohort.query()
    .where('id', id)
    .preload('tags')
    .withCount('people')
    .preload('people', (people) => {
      people.limit(peopleLimit)
      people.offset(peopleOffset)
      if (peopleSort && peopleOrder) {
        const camelSortStr = string.camelCase(peopleSort)
        if (camelSortStr === 'personType') {
          people
            .join('person_types', 'person_types.key', 'people.type_key')
            .orderBy('person_types.name', peopleOrder)
        } else {
          people.orderBy(camelSortStr, peopleOrder)
        }
      } else {
        people.orderBy('familyName', 'asc')
        people.orderBy('givenName', 'asc')
      }
      people.preload('tags')
      people.preload('personType', (personType) => {
        personType.preload('tags')
      })
      people.preload('user', (user) => {
        user.preload('tags')
      })
    })
    .firstOrFail()
}
export default class CohortsController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('cohorts')
    let query = Cohort.query().orderBy('name', 'asc').preload('tags')

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
    await request.validateUsing(createCohortValidator)
    const cleanRequest = request.only(['name', 'description', 'rules', 'tags'])
    // TODO: remove this when we change the type of tags
    if (cleanRequest.tags) {
      cleanRequest.tags = JSON.stringify(cleanRequest.tags)
    }
    const newCohort = await Cohort.create(cleanRequest)

    return {
      data: await getFullCohort(newCohort.id),
    }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    return {
      data: await Cohort.query()
        .orderBy('name', 'asc')
        .preload('tags')
        .where('id', params.id)
        .firstOrFail(),
    }
  }

  /**
   * Show individual record with people
   */
  async showWithPeople({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    const queryData = request.qs()
    const peopleLimit = (queryData['peopleLimit'] ||= 10)
    const peopleOffset = (queryData['peopleOffset'] ||= 0)
    const peopleSort = queryData['peopleSort']
    const peopleOrder = queryData['peopleOrder']

    return {
      data: await getFullCohort(params.id, peopleLimit, peopleOffset, peopleSort, peopleOrder),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateCohortValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['name', 'description', 'rules', 'tags'])
    // TODO: remove this when we change the type of tags
    if (cleanRequest.tags) {
      cleanRequest.tags = JSON.stringify(cleanRequest.tags)
    }
    const cohort = await Cohort.findOrFail(params.id)
    const updatedCohort = await cohort.merge(cleanRequest).save()

    return { data: await getFullCohort(updatedCohort.id) }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const cohort = await Cohort.findOrFail(params.id)
    await cohort.delete()
    response.status(204).send('')
  }

  /**
   * Assign Multiple People to Cohort
   */
  async attachPeople({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(peopleIdsValidator)
    const cleanRequest = request.only(['peopleIds'])
    const cohort = await Cohort.findOrFail(params.id)

    await cohort.related('people').attach(cleanRequest.peopleIds)

    response.status(201).send('')
  }

  /**
   * Unassign Multiple People from Cohort
   */
  async detachPeople({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(peopleIdsValidator)
    const cleanRequest = request.only(['peopleIds'])
    const cohort = await Cohort.findOrFail(params.id)

    await cohort.related('people').detach(cleanRequest.peopleIds)

    response.status(204).send('')
  }

  /**
   * Set All People for Cohort, any ids not in the request body will be removed
   */
  async setPeople({ params, request, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(peopleIdsValidator)
    const cleanRequest = request.only(['peopleIds'])
    const cohort = await Cohort.findOrFail(params.id)

    await cohort.related('people').sync(cleanRequest.peopleIds)

    response.status(201).send('')
  }
}
