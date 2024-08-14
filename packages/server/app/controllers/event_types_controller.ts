import EventType from '#models/event_type'
import { createEventTypeValidator } from '#validators/event_type'
import type { HttpContext } from '@adonisjs/core/http'

export default class EventTypesController {
  /**
   * Display a list of event
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const limit = queryData['limit']
    const offset = queryData['offset']

    let query = EventType.query()

    if (limit) {
      query.limit(limit)
    }
    if (offset) {
      query.offset(offset)
    }

    return { data: await query }
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createEventTypeValidator)
    const newEventType = await EventType.create(request.body())
    return { data: newEventType }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return {
      data: await EventType.query().where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Show record with related events
   */
  async showWithEvents({ params }: HttpContext) {
    return {
      data: await EventType.query().preload('events').where('id', params.id).firstOrFail(),
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createEventTypeValidator)
    const eventType = await EventType.findOrFail(params.id)
    const updatedEventType = await eventType.merge(request.body()).save()
    return { data: updatedEventType }
  }

  /**
   * Delete record
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    const eventType = await EventType.findOrFail(params.id)
    await eventType.delete()
    response.status(204).send('')
  }
}
