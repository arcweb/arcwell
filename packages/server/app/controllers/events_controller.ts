import Event from '#models/event'
import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import { buildApiQuery, buildEventsSort, setTagsForObject } from '#helpers/query_builder'
import db from '@adonisjs/lucid/services/db'

export default class EventsController {
  /**
   * @count
   * @summary Count Events
   * @description Returns the count of total events
   */
  async count({ auth }: HttpContext) {
    await auth.authenticate()

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

    query
      .preload('tags')
      .preload('person', (person: any) => {
        person.preload('tags')
        person.preload('user', (user: any) => {
          user.preload('tags')
        })
      })
      .preload('resource', (resource: any) => {
        resource.preload('tags')
      })
      .preload('eventType', (tags: any) => {
        tags.preload('tags')
      })

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
  async store({ request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(createEventValidator)
    const cleanRequest = request.only(['typeKey', 'startedAt', 'endedAt', 'personId', 'resourceId', 'tags'])
    let newEvent = null;

    await db.transaction(async (trx) => {
      newEvent = await Event.create(cleanRequest, trx)

      if (cleanRequest.tags && cleanRequest.tags.length > 0) {
        await setTagsForObject(trx, newEvent.id, 'events', cleanRequest.tags, false)
      }
    })

    let returnQuery = await Event.query()
      .where('id', newEvent.id)
      .preload('tags')
      .preload('eventType', (tags) => {
        tags.preload('tags')
      })
      .firstOrFail()

    const createdEvent = await Event.query()
      .where('id', returnQuery.id)
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
      .preload('eventType', (tags) => {
        tags.preload('tags')
      })
      .preload('facts', (facts) => {
        facts.preload('tags')
      })
      .firstOrFail()

    return { data: createdEvent }
  }

  /**
   * @show
   * @summary Get Event
   * @description Retrieve an individual Event record from Arcwell
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await Event.query()
        .where('id', params.id)
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
        .preload('eventType', (tags) => {
          tags.preload('tags')
        })
        .firstOrFail(),
    }
  }

  /**
   * @update
   * @summary Update Event
   * @description Update an individual Event record within Arcwell
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateEventValidator)
    await paramsUUIDValidator.validate(params)
    // TODO Add person/personId and resource/resourceId when implemented
    const cleanRequest = request.only(['typeKey', 'startedAt', 'endedAt', 'personId', 'resourceId'])
    let updatedEvent = null
    await db.transaction(async (trx) => {
      const event = await Event.findOrFail(params.id)
      event.useTransaction(trx)
      updatedEvent = await event.merge(cleanRequest).save()

      if (cleanRequest.tags) {
        await setTagsForObject(trx, event.id, 'events', cleanRequest.tags)
      }
    })

    let returnQuery = Event.query()
      .where('id', updatedEvent.id)
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
   * @destroy
   * @summary Delete Event
   * @description Remove an individual Event from this Arcwell instance
   */
  async destroy({ params, auth, response }: HttpContext) {
    await auth.authenticate()
    await paramsUUIDValidator.validate(params)
    const event = await Event.findOrFail(params.id)
    await event.delete()
    response.status(204).send('')
  }
}
