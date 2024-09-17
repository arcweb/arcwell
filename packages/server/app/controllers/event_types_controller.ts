import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventTypeValidator, updateEventTypeValidator } from '#validators/event_type'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export function getFullEventType(id: string) {
  return EventType.query().preload('tags').where('id', id).firstOrFail()
}

export default class EventTypesController {
  /**
   * Display a list of event
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']
    const sort = queryData['sort']
    const order = queryData['order']

    let countQuery = db.from('event_types')

    let query = EventType.query().preload('tags')

    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
    }
    if (sort && order) {
      console.log(query)
      query.orderBy(sort, order)
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
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createEventTypeValidator)
    const newEventType = await EventType.create(request.body())
    return { data: await getFullEventType(newEventType.id) }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await EventType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * Show record with related events
   */
  async showWithEvents({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await EventType.query()
        .preload('events', (event) => {
          event.preload('tags')
          event.preload('facts', (fact) => {
            fact.preload('tags')
          })
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
    await request.validateUsing(updateEventTypeValidator)
    await paramsUUIDValidator.validate(params)
    const eventType = await EventType.findOrFail(params.id)
    const updatedEventType = await eventType.merge(request.body()).save()

    return { data: await getFullEventType(updatedEventType.id) }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const eventType = await EventType.findOrFail(params.id)
    await eventType.delete()
    response.status(204).send('')
  }
}
