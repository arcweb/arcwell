import Fact from '#models/fact'
import { paramsUUIDValidator } from '#validators/common'
import { createFactValidator, updateFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class FactsController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const factTypeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('facts')

    let query = Fact.query()
      .orderBy('observedAt', 'desc')
      .preload('factType')
      .preload('tags')
      .preload('person', (person) => {
        person.preload('tags')
        person.preload('user', (user) => {
          user.preload('tags')
        })
      })
      .preload('resource', (resource) => {
        resource.preload('tags')
      })
      .preload('event', (event) => {
        event.preload('tags')
      })

    if (factTypeKey) {
      query.where('typeKey', factTypeKey)
      // DB context use sql column names
      countQuery.where('type_key', factTypeKey)
    }
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
    await request.validateUsing(createFactValidator)
    // TODO: remove this when we change the type of tags
    if (request.body().tags) {
      request.body().tags = JSON.stringify(request.body().tags)
    }
    // @ts-ignore - stringify is required for knex and jsonb arrays
    const newFact = await Fact.create(request.body())
    return { data: newFact }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    return {
      data: await Fact.query()
        .where('id', params.id)
        .preload('factType')
        .preload('tags')
        .preload('person', (person) => {
          person.preload('tags')
          person.preload('user', (user) => {
            user.preload('tags')
          })
        })
        .preload('resource', (resource) => {
          resource.preload('tags')
        })
        .preload('event', (event) => {
          event.preload('tags')
        })
        .firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateFactValidator)

    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['typeKey', 'observedAt', 'dimensions', 'meta', 'tags'])
    if (cleanRequest.tags) {
      cleanRequest.tags = JSON.stringify(cleanRequest.tags)
    }
    const fact = await Fact.findOrFail(params.id)
    const updatedFact = await fact.merge(cleanRequest).save()
    return { data: updatedFact }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const fact = await Fact.findOrFail(params.id)
    await fact.delete()
    response.status(204).send('')
  }
}
