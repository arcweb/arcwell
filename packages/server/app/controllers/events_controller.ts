import Event from '#models/event'
import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildEventsSort } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'
import EventService from '#services/event_service'
import { ExtractScopes } from '@adonisjs/lucid/types/model'

export default class EventsController {
  /**
   * @count
   * @summary Count Events
   * @description Returns the count of total events
   */
  async count({}: HttpContext) {
    const countQuery = db.from('events').count('*')
    const queryCount = await countQuery.count('*')

    return {
      data: {
        count: +queryCount[0].count,
      },
    }
  }

  /**
   * @index
   * @summary List Events
   * @description Retrieve a list of Event records
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const typeKey = queryData['typeKey']

    let [query, countQuery] = buildApiQuery(Event.query(), queryData, 'events', 'typeKey')

    query.apply((scopes: ExtractScopes<typeof Event>) => scopes.fullEvent())

    buildEventsSort(query, queryData)

    if (typeKey) {
      const eventType = await EventType.findByOrFail('key', typeKey)
      query.where('typeKey', eventType.key)
      countQuery.where('type_key', eventType.key)
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
   * @summary Create Event
   * @description Create a new Event record within Arcwell
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createEventValidator)
    const cleanRequest = request.only([
      'typeKey',
      'startedAt',
      'endedAt',
      'personId',
      'resourceId',
      'tags',
    ])

    return db.transaction(async (trx) => {
      const newEvent = await EventService.createEvent(trx, cleanRequest, cleanRequest.tags)
      return EventService.getFullEvent(newEvent.id, trx)
    })
  }

  /**
   * @show
   * @summary Get Event
   * @description Retrieve an individual Event record from Arcwell
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return { data: await EventService.getFullEvent(params.id) }
  }

  /**
   * @update
   * @summary Update Event
   * @description Update an individual Event record within Arcwell
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateEventValidator)
    await paramsUUIDValidator.validate(params)

    // TODO Add person/personId and resource/resourceId when implemented
    const cleanRequest = request.only(['typeKey', 'startedAt', 'endedAt', 'personId', 'resourceId'])

    return db.transaction(async (trx) => {
      const updatedEvent = await EventService.updateEvent(
        trx,
        params.id,
        cleanRequest,
        request.input('tags')
      )
      return { data: await EventService.getFullEvent(updatedEvent.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete Event
   * @description Remove an individual Event from this Arcwell instance
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const event = await Event.findOrFail(params.id)
    await event.delete()
    response.status(204).send('')
  }
}
