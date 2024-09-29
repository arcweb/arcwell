import { buildApiQuery } from '#helpers/query_builder'
import FactType from '#models/fact_type'
import { paramsUUIDValidator } from '#validators/common'
import { createFactTypeValidator, updateFactTypeValidator } from '#validators/fact_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import { TransactionClientContract } from '@adonisjs/lucid/types/database'

export function getFullFactType(id: string, trx?: TransactionClientContract) {
  if (trx) {
    return FactType.query({ client: trx }).where('id', id).preload('tags').firstOrFail()
  } else {
    return FactType.query().where('id', id).preload('tags').firstOrFail()
  }
}

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

    let [query, countQuery] = buildApiQuery(FactType.query(), queryData, 'event_types')

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
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createFactTypeValidator)
    // TODO: remove this when we change the type of tags
    if (request.body().tags) {
      request.body().tags = JSON.stringify(request.body().tags)
    }
    // @ts-ignore - stringify is required for knex and jsonb arrays
    const newFactType = await FactType.create(request.body())

    return { data: await getFullFactType(newFactType.id) }
  }

  // TODO: Below is work in progress, we might pivot to jsonb for dimension types
  // async store({ request, auth }: HttpContext) {
  //   await auth.authenticate()
  //   await request.validateUsing(createFactTypeValidator)
  //
  //   const cleanRequest = request.only(['name', 'description', 'key', 'tags', 'dimensionTypes'])
  //
  //   const trx = await db.transaction()
  //
  //   let newFactType = null
  //
  //   try {
  //     const factType = new FactType().fill(cleanRequest).useTransaction(trx)
  //
  //     newFactType = await factType.save()
  //
  //     if (cleanRequest.dimensionTypes) {
  //       for (const dimensionType of cleanRequest.dimensionTypes) {
  //         const isRequired = dimensionType.isRequired
  //         delete dimensionType.isRequired
  //
  //         // await newFactType.related('dimensionTypes').create(dimensionType)
  //         await newFactType
  //           .related('dimensionTypes')
  //           .create(dimensionType, { is_required: isRequired })
  //       }
  //     }
  //     await trx.commit()
  //     const fullFactType = await getFullFactType(newFactType.id)
  //     return { data: await this.transformObject(fullFactType) }
  //   } catch (error) {
  //     await trx.rollback()
  //     throwCustomHttpError(
  //       {
  //         title: 'Database exception',
  //         code: 'E_DATABASE_EXCEPTION',
  //         detail: error && error.detail ? error.detail : 'Unknown error',
  //       },
  //       500
  //     )
  //   }
  // }

  /**
   * @show
   * @summary Get FactType
   * @description Retrieve an individual type definition used by Fact records. See schema, dimensions, and requirements for a class of Fact records within Arcwell.
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    return {
      data: await FactType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * @showWithFacts
   * @summary List Facts by Type
   * @description Retireve a list of Fact records of a given FactType
   * @paramUse(sortable, filterable)
   */
  async showWithFacts({ params, auth }: HttpContext) {
    await auth.authenticate()
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
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateFactTypeValidator)

    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['key', 'name', 'description', 'tags'])
    if (cleanRequest.tags) {
      cleanRequest.tags = JSON.stringify(cleanRequest.tags)
    }
    const factType = await FactType.findOrFail(params.id)
    const updatedFactType = await factType.merge(cleanRequest).save()

    return { data: await getFullFactType(updatedFactType.id) }
  }

  /**
   * @destroy
   * @summary Delete FactType
   * @description Remove a type definition used by Fact records from Arcwell
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const factType = await FactType.findOrFail(params.id)
    await factType.delete()
    response.status(204).send('')
  }
}
