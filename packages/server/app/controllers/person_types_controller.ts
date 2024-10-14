import { buildApiQuery } from '#helpers/query_builder'
import PersonType from '#models/person_type'
import PersonTypeService from '#services/person_type_service'
import { paramsUUIDValidator } from '#validators/common'
import { createPersonTypeValidator, updatePersonTypeValidator } from '#validators/person_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class PersonTypesController {
  /**
   * @index
   * @summary List Person Types
   * @description Returns a list of People Type definitions, including name, key, and custom schema.
   * @paramUse(sortable, filterable)
   * @responseBody 200 - {}
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = buildApiQuery(PersonType.query(), queryData, 'person_types')

    query.preload('tags')

    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      query.orderBy(camelSortStr, order)
    } else {
      query.orderBy('name', 'asc')
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
   * @summary Create PersonType
   * @description Create a new class type of Person, specificying schema and storage rules.
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createPersonTypeValidator)

    return db.transaction(async (trx) => {
      const newPersonType = await PersonTypeService.createPersonTypeWithTags(trx, request.body(), request.input('tags'))
      return { data: await PersonTypeService.getFullPersonType(newPersonType.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get PersonType
   * @description Return details about an individual class of Person, including schema and storage rules.
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await PersonType.query().preload('tags').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * @showWithPeople
   * @summary List People of Type
   * @description Returns a list of People within a specific PersonType
   * @paramUse(sortable, filterable)
   * @responseBody 200 - { data: [People] }
   */
  async showWithPeople({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await PersonType.query().preload('people').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update PersonType
   * @description Update the definition for an existing individual Person Type.
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updatePersonTypeValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name', 'key', 'description'])

    return db.transaction(async (trx) => {
      const updatedPersonType = await PersonTypeService.updatePersonTypeWithTags(trx, params.id, cleanRequest, request.input('tags'))
      return { data: await PersonTypeService.getFullPersonType(updatedPersonType.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete PersonType
   * @description Remove the definition for an existing Person Type from Arcwell
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const personType = await PersonType.findOrFail(params.id)
    await personType.delete()
    response.status(204).send('')
  }
}
