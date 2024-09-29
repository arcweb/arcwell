import { buildApiQuery } from '#helpers/query_builder'
import Cohort from '#models/cohort'
import {
  createCohortValidator,
  peopleIdsValidator,
  updateCohortValidator,
} from '#validators/cohort'
import { paramsUUIDValidator } from '#validators/common'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

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
   * @index
   * @summary List Cohorts
   * @description Returns a list of Cohort objects and their details. Sortable and filterable.
   * @paramUse(sortable, filterable)
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    let [query, countQuery] = buildApiQuery(Cohort.query(), queryData, 'cohorts')

    query.orderBy('name', 'asc').preload('tags')

    const notRelatedToPerson = queryData['notRelatedToPerson']

    query.orderBy('name', 'asc').preload('tags')

    if (notRelatedToPerson) {
      // Get complete list of cohort ids associated with person to filter them out
      // in add cohort to person form
      const cohortIdInPersonQuery = await db
        .from('cohorts')
        .select('id')
        .whereIn(
          'id',
          db.from('cohort_person').select('cohort_id').where('person_id', notRelatedToPerson)
        )
      const idList = cohortIdInPersonQuery.map((id) => id['id'])
      query.whereNotIn('id', idList)
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
   * @store
   * @summary Create Cohort
   * @description Insert a new Cohort record into Arcwell
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
   * @show
   * @summary Get Cohort
   * @description Retrieve the details of an individual Cohort record.
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
   * @showWithPeople
   * @summary Get Cohort with People List
   * @description Retrieve the details of an individual Cohorot, but include a list of the member People records.
   */
  async showWithPeople({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    const queryData = request.qs()
    const peopleLimit = (queryData['peopleLimit'] ||= 10)
    const peopleOffset = (queryData['peopleOffset'] ||= 0)
    const peopleSort = string.camelCase(queryData['peopleSort'])
    const peopleOrder = queryData['peopleOrder']

    return {
      data: await getFullCohort(params.id, peopleLimit, peopleOffset, peopleSort, peopleOrder),
    }
  }

  /**
   * @update
   * @summary Update Cohort
   * @description Update the details for an existing individual Cohort record.
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
   * @destroy
   * @summary Delete Cohort
   * @description Remove the indicated Cohort from the Arcwell instance.
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const cohort = await Cohort.findOrFail(params.id)
    await cohort.delete()
    response.status(204).send('')
  }

  /**
   * @attachPeople
   * @summary Add People to Cohort
   * @description Manage grouping by adding People to this Cohort.
   * @paramQuery peopleIds - Array of IDs of Person records to add
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
   * @detachPeople
   * @summary Remove People from Cohort
   * @description Manage grouping by removing People from this Cohort.
   * @paramQuery peopleIds - Array of IDs of Person records to remove
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
   * @setPeople
   * @summary Set People in Cohort
   * @description Manage grouping by setting the complete membership of People within this Cohort.
   * @paramQuery peopleIds - Array of IDs of Person records to set as the membership of the Cohort
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
