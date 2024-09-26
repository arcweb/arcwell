import Event from '#models/event'
import EventType from '#models/event_type'
import { paramsUUIDValidator } from '#validators/common'
import { createEventValidator, updateEventValidator } from '#validators/event'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import string from '@adonisjs/core/helpers/string'
import { buildApiQuery } from '#helpers/query_builder'
import Person from '#models/person'

export default class EventsController {
  /**
   * Display a list of events
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()

    const typeKey = queryData['typeKey']
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = buildApiQuery(Event.query(), queryData, 'events', 'typeKey')

    query = query
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

    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      switch (camelSortStr) {
        case 'eventType':
          query
            .join('event_types', 'event_types.key', 'events.type_key')
            .orderBy('event_types.name', order)
          break
        case 'person':
          query
            .leftOuterJoin('people', 'people.id', 'events.person_id')
            .orderBy('people.family_name', order)
            .select('events.*')
          break
        case 'resource':
          query
            .leftOuterJoin('resources', 'resources.id', 'events.resource_id')
            .orderBy('resources.name', order)
            .select('events.*')
          break
        default:
          query.orderBy(camelSortStr, order)
      }
    } else {
      query.orderBy('startedAt', 'desc')
    }

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
