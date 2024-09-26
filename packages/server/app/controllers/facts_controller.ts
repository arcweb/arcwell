import Fact from '#models/fact'
import FactType from '#models/fact_type'
import { paramsUUIDValidator } from '#validators/common'
import { createFactValidator, updateFactValidator } from '#validators/fact'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

export async function getFullFact(id: string) {
  return Fact.query()
    .where('id', id)
    .preload('factType')
    .preload('tags')
    .preload('dimensions')
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
    .firstOrFail()
}

export default class FactsController {
  /**
   * Display a list of resource
   */
  async index({ request, auth }: HttpContext) {
    await auth.authenticate()
    const queryData = request.qs()
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const sort = queryData['sort']
    const order = queryData['order']

    let countQuery = db.from('facts')

    let query = Fact.query()
      .preload('factType')
      .preload('tags')
      .preload('dimensions')
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

    if (typeKey) {
      const factType = await FactType.findByOrFail('key', typeKey)
      query.where('typeKey', factType.key)
      // DB context use sql column names
      countQuery.where('type_key', factType.key)
    }
    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      switch (camelSortStr) {
        case 'factType':
          query
            .join('fact_types', 'fact_types.key', 'facts.type_key')
            .orderBy('fact_types.name', order)
          break
        case 'person':
          query
            .leftOuterJoin('people', 'people.id', 'facts.person_id')
            .orderBy('people.family_name', order)
            .select('facts.*')
          break
        case 'resource':
          query
            .leftOuterJoin('resources', 'resources.id', 'facts.resource_id')
            .orderBy('resources.name', order)
            .select('facts.*')
          break
        case 'event':
          query
            .leftOuterJoin('events', 'events.id', 'facts.event_id')
            .orderBy('events.started_at', order)
            .select('facts.*')
          break
        default:
          query.orderBy(camelSortStr, order)
      }
    } else {
      query.orderBy('observedAt', 'desc')
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
    const newFact = await Fact.create(request.body())
    return { data: await getFullFact(newFact.id) }
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)

    return {
      data: await getFullFact(params.id),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateFactValidator)

    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['typeKey', 'observedAt', 'dimensions', 'info', 'tags'])
    if (cleanRequest.tags) {
      cleanRequest.tags = JSON.stringify(cleanRequest.tags)
    }
    const fact = await Fact.findOrFail(params.id)
    await fact.merge(cleanRequest).save()
    return { data: await getFullFact(params.id) }
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
