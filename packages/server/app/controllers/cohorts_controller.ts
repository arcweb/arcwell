import { buildApiQuery, buildPeopleSort, setTagsForObject } from '#helpers/query_builder'
import Cohort from '#models/cohort'
import {
  createCohortValidator,
  peopleIdsValidator,
  updateCohortValidator,
} from '#validators/cohort'
import { paramsUUIDValidator } from '#validators/common'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullCohort(id: string, queryData?: Record<string, any>) {
  return Cohort.query()
    .where('id', id)
    .preload('tags')
    .withCount('people')
    .preload('people', (people) => {
      let [peopleQuery] = buildApiQuery(people, queryData, 'people')
      peopleQuery.preload('personType')
      buildPeopleSort(peopleQuery, queryData)
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
  async store({ request }: HttpContext) {
    await request.validateUsing(createCohortValidator)
    const cleanRequest = request.only(['name', 'description', 'tags'])
    // let newCohortId: string

    const newCohort = await db.transaction(async (trx) => {
      const cohort = new Cohort().fill(cleanRequest).useTransaction(trx)
      await cohort.save()

      if (cleanRequest.tags && cleanRequest.tags.length > 0) {
        await setTagsForObject(trx, cohort.id, 'cohorts', cleanRequest.tags, false)
      }
      return cohort
    })

    return {
      data: await getFullCohort(newCohort.id),
    }
  }

  /**
   * @show
   * @summary Get Cohort
   * @description Retrieve the details of an individual Cohort record.
   */
  async show({ params }: HttpContext) {
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
  async showWithPeople({ params, request }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    const queryData = request.qs()
    return {
      data: await getFullCohort(params.id, queryData),
    }
  }

  /**
   * @update
   * @summary Update Cohort
   * @description Update the details for an existing individual Cohort record.
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateCohortValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['name', 'description', 'tags'])

    const updatedCohort = await db.transaction(async (trx) => {
      const existingCohort = await Cohort.findOrFail(params.id)
      existingCohort.useTransaction(trx)
      const cohort = await existingCohort.merge(cleanRequest).save()

      if (cleanRequest.tags) {
        await setTagsForObject(trx, updatedCohort.id, 'cohorts', cleanRequest.tags)
      }
      return cohort
    })

    return { data: await getFullCohort(updatedCohort.id) }
  }

  /**
   * @destroy
   * @summary Delete Cohort
   * @description Remove the indicated Cohort from the Arcwell instance.
   */
  async destroy({ params, response }: HttpContext) {
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
  async attachPeople({ params, request, response }: HttpContext) {
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
  async detachPeople({ params, request, response }: HttpContext) {
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
  async setPeople({ params, request, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(peopleIdsValidator)
    const cleanRequest = request.only(['peopleIds'])
    const cohort = await Cohort.findOrFail(params.id)

    await cohort.related('people').sync(cleanRequest.peopleIds)

    response.status(201).send('')
  }
}
