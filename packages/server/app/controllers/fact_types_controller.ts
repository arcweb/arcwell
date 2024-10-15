import { buildApiQuery } from '#helpers/query_builder'
import FactType from '#models/fact_type'
import FactTypeService from '#services/fact_type_service'
import { paramsUUIDValidator } from '#validators/common'
import { createFactTypeValidator, updateFactTypeValidator } from '#validators/fact_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class FactTypesController {
  /**
   * @index
   * @summary List FactTypes
   * @description Retrieve a list of type definitions used for Fact records.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = buildApiQuery(FactType.query(), queryData, 'fact_types')

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
   * @summary Create FactType
   * @description Create a new type definition for use by Fact records. Define schema, dimensions, and requirements for a class of Fact records within Arcwell.
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createFactTypeValidator)

    return db.transaction(async (trx) => {
      const newFactType = await FactTypeService.createFactType(
        trx,
        request.body(),
        request.input('tags')
      )
      return { data: await FactTypeService.getFullFactType(newFactType.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get FactType
   * @description Retrieve an individual type definition used by Fact records. See schema, dimensions, and requirements for a class of Fact records within Arcwell.
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    return {
      data: await FactType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * @showWithFacts
   * @summary List Facts by Type
   * @description Retrieve a list of Fact records of a given FactType
   * @paramUse(sortable, filterable)
   */
  async showWithFacts({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await FactType.query()
        .preload('tags')
        .preload('facts', (fact) => {
          fact.preload('tags')
        })
        .where('id', params.id)
        .firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update FactType
   * @description Update an existing type definition used by Fact records. Define schema, dimensions, and requirements for a class of Fact records within Arcwell.
   */
  async update({ request, params }: HttpContext) {
    await request.validateUsing(updateFactTypeValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['key', 'name', 'description', 'dimensionSchemas', 'tags'])

    return await db.transaction(async (trx) => {
      const updatedFactType = await FactTypeService.updateFactType(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await FactTypeService.getFullFactType(updatedFactType.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete FactType
   * @description Remove a type definition used by Fact records from Arcwell
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const factType = await FactType.findOrFail(params.id)
    await factType.delete()
    response.status(204).send('')
  }
}
