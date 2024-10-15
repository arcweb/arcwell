import Person from '#models/person'
import PersonType from '#models/person_type'
import { paramsUUIDValidator } from '#validators/common'
import {
  createPersonValidator,
  updatePersonValidator,
  cohortIdsValidator,
} from '#validators/person'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { buildApiQuery, buildPeopleSort } from '#helpers/query_builder'
import { ExtractScopes } from '@adonisjs/lucid/types/model'
import PersonService from '#services/person_service'

export default class PeopleController {
  /**
   * @count
   * @summary Count People
   * @description Returns the count of total people
   */
  async count({}: HttpContext) {
    const countQuery = db.from('people').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List People
   * @description Returns a list of People objects and their details. Sortable and filterable.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    const typeKey = queryData['typeKey']
    const notInCohort = queryData['notInCohort']

    let [query, countQuery] = buildApiQuery(Person.query(), queryData, 'people', 'familyName')

    query.apply((scopes: ExtractScopes<typeof Person>) => scopes.fullPerson())

    if (typeKey) {
      const personType = await PersonType.findByOrFail('key', typeKey)
      query.where('typeKey', personType.key)
      // DB context use sql column names
      countQuery.where('type_key', personType.key)
    }
    buildPeopleSort(query, queryData)
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
   * @summary Create Person
   * @description Create a new Person record within Arcwell.
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createPersonValidator)

    return db.transaction(async (trx) => {
      const newPerson = await PersonService.createPerson(trx, request.body(), request.input('tags'))
      return { data: await PersonService.getFullPerson(newPerson.id, 10, 0, trx) }
    })
  }

  /**
   * @show
   * @summary Get Person
   * @description Return individual details about a single Person record.
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await Person.query()
        .where('id', params.id)
        .withScopes((scopes) => scopes.fullPerson())
        .firstOrFail(),
    }
  }

  /**
   * @showWithCohorts
   * @summary Get Person with Cohorts
   * @description Return details about a Person and include Cohorts of which they are a member.
   */
  async showWithCohorts({ params, request }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    const queryData = request.qs()
    const cohortLimit = (queryData['cohortLimit'] ||= 10)
    const cohortOffset = (queryData['cohortOffset'] ||= 0)

    return {
      data: await PersonService.getFullPerson(params.id, cohortLimit, cohortOffset),
    }
  }

  /**
   * @update
   * @summary Update Person
   * @description Update the details for an existing individual Person record.
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updatePersonValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['givenName', 'familyName', 'typeKey'])

    return db.transaction(async (trx) => {
      const updatedPerson = await PersonService.updatePerson(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await PersonService.getFullPerson(updatedPerson.id, 10, 0, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Person
   * @description Remove an individual Person record from Arcwell.
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const person = await Person.findOrFail(params.id)
    await person.delete()
    response.status(204).send('')
  }

  /**
   * @attachCohort
   * @summary Add Person to Cohort
   * @description Manage grouping by adding a Person to a Cohort.
   */
  async attachCohort({ params, request, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(cohortIdsValidator)
    const cleanRequest = request.only(['cohortIds'])
    const person = await Person.findOrFail(params.id)

    await person.related('cohorts').attach(cleanRequest.cohortIds)

    response.status(201).send('')
  }

  /**
   * @detachCohort
   * @summary Remove Person from Cohort
   * @description Manage grouping by removing a Person from a Cohort.
   */
  async detachCohort({ params, request, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    await request.validateUsing(cohortIdsValidator)
    const cleanRequest = request.only(['cohortIds'])
    const person = await Person.findOrFail(params.id)

    await person.related('cohorts').detach(cleanRequest.cohortIds)

    response.status(204).send('')
  }
}
