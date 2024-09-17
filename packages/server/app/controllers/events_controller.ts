import Event from '#models/event'
import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class EventsController {
  /**
   * Display a list of events
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']
    const sort = queryData['sort']
    const order = queryData['order']

    let countQuery = db.from('events')

    let query = Event.query()
      .preload('tags')
      .preload('eventType', (type) => {
        type.preload('tags')
      })

    if (sort && order) {
      if (sort === 'eventType') {
        query
          .join('event_types', 'event_types.key', 'events.type_key')
          .orderBy('event_types.name', order)
      } else {
        query.orderBy(sort, order)
      }
    } else {
      query.orderBy('name', 'asc')
    }
    if (typeKey) {
      const eventType = await EventType.findByOrFail('key', typeKey)
      query.where('typeKey', eventType.key)
      countQuery.where('type_key', eventType.key)
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
    await request.validateUsing(createEventValidator)
    const newEvent = await Event.create(request.body())

    let returnQuery = Event.query()
      .where('id', newEvent.id)
      .preload('tags')
      .preload('eventType', (tags) => {
        tags.preload('tags')
      })
      .firstOrFail()

    return { data: await returnQuery }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await Event.query()
        .where('id', params.id)
        .preload('tags')
        .preload('eventType', (tags) => {
          tags.preload('tags')
        })
        .firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateEventValidator)
    await paramsUUIDValidator.validate(params)
    const cleanRequest = request.only(['name', 'typeKey', 'source', 'occurredAt'])
    const event = await Event.findOrFail(params.id)
    const updatedEvent = await event.merge(cleanRequest).save()

    let returnQuery = Event.query()
      .where('id', updatedEvent.id)
      .preload('tags')
      .preload('eventType', (tags) => {
        tags.preload('tags')
      })
      .preload('facts', (facts) => {
        facts.preload('tags')
      })
      .firstOrFail()

    return { data: await returnQuery }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const event = await Event.findOrFail(params.id)
    await event.delete()
    response.status(204).send('')
  }
}
