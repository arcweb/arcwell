import FactType from '#models/fact_type'
import { paramsUUIDValidator } from '#validators/common'
import { createFactTypeValidator, updateFactTypeValidator } from '#validators/fact_type'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullFactType(id: string) {
  return FactType.query().where('id', id).preload('tags').firstOrFail()
}

export default class FactTypesController {
  /**
   * Display a list of resource
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('fact_types')

    let query = FactType.query().preload('tags').orderBy('name', 'asc')

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
    await request.validateUsing(createFactTypeValidator)
    // TODO: remove this when we change the type of tags
    if (request.body().tags) {
      request.body().tags = JSON.stringify(request.body().tags)
    }
    // @ts-ignore - stringify is required for knex and jsonb arrays
    const newFactType = await FactType.create(request.body())

    return { data: await getFullFactType(newFactType.id) }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    return {
      data: await FactType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * Show record with related facts
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
   * Handle form submission for the edit action
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
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const factType = await FactType.findOrFail(params.id)
    await factType.delete()
    response.status(204).send('')
  }
}
