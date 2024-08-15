import Event from '#models/event'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class EventsController {
  /**
   * Display a list of event
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const eventTypeId = queryData['eventTypeId']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('events')
    let query = Event.query().preload('eventType')

    if (eventTypeId) {
      query.where('eventTypeId', eventTypeId)
      countQuery.where('event_type_id', eventTypeId)
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
    return { data: newEvent }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await Event.query().where('id', params.id).preload('eventType').firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateEventValidator)
    const cleanRequest = request.only(['name'])
    const event = await Event.findOrFail(params.id)
    const updatedEvent = await event.merge(cleanRequest).save()
    return { data: updatedEvent }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const event = await Event.findOrFail(params.id)
    await event.delete()
    response.status(204).send('')
  }
}
