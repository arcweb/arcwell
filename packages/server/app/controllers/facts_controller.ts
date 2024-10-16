import Fact from '#models/fact'
import FactType from '#models/fact_type'
import { paramsUUIDValidator } from '#validators/common'
import { createFactValidator, updateFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildFactsSort } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import FactService from '#services/fact_service'
import { ExtractScopes } from '@adonisjs/lucid/types/model'
import { validateDimensions } from '#validators/dimension'
import { throwCustomHttpError } from '#exceptions/handler_helper'

export default class FactsController {
  /**
   * @count
   * @summary Count facts
   * @description Returns the count of total facts
   */
  async count({}: HttpContext) {
    const countQuery = db.from('facts').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Facts
   * @description Retrieve a list of Fact records. This method is best used for administrative and management functions. Consider the Data API for querying facts with dimension for statistical and review purposes.
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const typeKey = queryData['typeKey']

    let [query, countQuery] = buildApiQuery(Fact.query(), queryData, 'facts')

    query.apply((scopes: ExtractScopes<typeof Fact>) => scopes.fullFact())

    if (typeKey) {
      const factType = await FactType.findByOrFail('key', typeKey)
      query.where('typeKey', factType.key)
      // DB context use sql column names
      countQuery.where('type_key', factType.key)
    }
    buildFactsSort(query, queryData)

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
   * @summary Create Fact
   * @description Create a Fact within Arcwell's data system. This method is intended for administrative and management use. Consider the Data API for inserting facts with dimension for application and statistical purposes.
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createFactValidator)

    const cleanRequest = request.only([
      'typeKey',
      'observedAt',
      'dimensions',
      'personId',
      'resourceId',
      'eventId',
    ])

    cleanRequest.dimensions ??= []

    const factType = await FactType.query().where('key', cleanRequest.typeKey).firstOrFail()

    const validationErrorMessage = await validateDimensions(
      cleanRequest.dimensions,
      factType.dimensionSchemas
    )

    if (validationErrorMessage) {
      throwCustomHttpError(
        {
          title: 'Dimension validation failed',
          code: 'E_VALIDATION_ERROR',
          detail: validationErrorMessage,
        },
        400
      )
      return
    }

    return db.transaction(async (trx) => {
      const newFact = await FactService.createFact(trx, cleanRequest, request.input('tags'))
      return { data: await FactService.getFullFact(newFact.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get Fact
   * @description Retrieve an individual Fact record. This method is best used for administrative and management functions. Consider the Data API for querying facts with dimension for statistical and review purposes.
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)

    return {
      data: await FactService.getFullFact(params.id),
    }
  }

  /**
   * @update
   * @summary Update Fact
   * @description Update an existing Fact record. This method is best used for administrative and management functions. Consider the Data API for inserting and manipulating facts with dimension for statistical and review purposes.
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateFactValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['typeKey', 'observedAt', 'dimensions'])

    if (cleanRequest.dimensions) {
      const factType = await FactType.query().where('key', cleanRequest.typeKey).firstOrFail()

      const validationErrorMessage = await validateDimensions(
        cleanRequest.dimensions,
        factType.dimensionSchemas
      )

      if (validationErrorMessage) {
        throwCustomHttpError(
          {
            title: 'Dimension validation failed',
            code: 'E_VALIDATION_ERROR',
            detail: validationErrorMessage,
          },
          400
        )
        return
      }
    }

    return db.transaction(async (trx) => {
      const updatedFact = await FactService.updateFact(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await FactService.getFullFact(updatedFact.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Fact
   * @description Remove a Fact record. This method is best used for administrative and management functions. Consider the Data API for data set manipulation.
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const fact = await Fact.findOrFail(params.id)
    await fact.delete()
    response.status(204).send('')
  }

  // TODO: Temporarily removing this until we have the api endpoint discussion
  // async insertWithFactType({ auth, params, request }: HttpContext) {
  //   await auth.authenticate()
  //
  //   const cleanRequest = request.only([
  //     'typeKey',
  //     'observedAt',
  //     'info',
  //     'dimensions',
  //     'personId',
  //     'resourceId',
  //     'eventId',
  //   ])
  //
  //   // TODO Not needed, since it will fail on foreign key constraint
  //   // const factType = FactType.findByOrFail('type_key', params.fact_type_key)
  //
  //   let newFact = null as Fact | null
  //
  //   await db.transaction(async (trx) => {
  //     newFact = new Fact()
  //       .fill({ ...cleanRequest, typeKey: params.fact_type_key })
  //       .useTransaction(trx)
  //     await newFact.save()
  //
  //     if (cleanRequest.dimensions) {
  //       for (const dimension of cleanRequest.dimensions) {
  //         await newFact.related('dimensions').create(dimension)
  //       }
  //     }
  //
  //     // TODO: Should tags be added?  If so should they delete any that aren't included or just add provided.  (should remove, i beleive)
  //     // TODO: What if empty tags are added, do we delete, or is that considered a "just ignore tags"
  //   })
  //
  //   // Load the full object to return
  //   let newCreatedFact = null
  //   if (newFact) {
  //     newCreatedFact = await getFullFact(newFact.id)
  //   }
  //
  //   return { data: newCreatedFact }
  // }
}
