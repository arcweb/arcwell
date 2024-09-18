import Event from '#models/event'
import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'

export default class EventsController {
  /**
   * Display a list of events
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    const search = queryData['search']
    const typeKey = queryData['typeKey']
    const limit = queryData['limit']
    const offset = queryData['offset']

    let countQuery = db.from('events')
    let query = Event.query()
      .orderBy('startedAt', 'desc')
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

    // Add search functionality to query
    if (typeof search === 'string') {
      query.whereILike('familyName', search)
      countQuery.whereILike('familyName', search)
    } else if (typeof search === 'object' && search !== null) {
      for (const key in search) {
        if (search.hasOwnProperty(key)) {
          const searchString = '%' + search[key] + '%'
          query.whereILike(string.camelCase(key), searchString)
          countQuery.whereILike(string.snakeCase(key), searchString)
        }
      }
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
    const cleanRequest = request.only(['typeKey', 'startedAt', 'endedAt', 'personId', 'resourceId'])
    const newEvent = await Event.create(cleanRequest)

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
   * Show individual record
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
   * Handle form submission for the edit action
   */
  async update({ params, request, auth }: HttpContext) {
    await auth.authenticate()
    await request.validateUsing(updateEventValidator)
    await paramsUUIDValidator.validate(params)
    // TODO Add person/personId and resource/resourceId when implemented
    const cleanRequest = request.only(['typeKey', 'startedAt', 'endedAt', 'personId', 'resourceId'])
    const event = await Event.findOrFail(params.id)
    const updatedEvent = await event.merge(cleanRequest).save()

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
