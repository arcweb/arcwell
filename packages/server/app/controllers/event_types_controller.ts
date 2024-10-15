import { buildApiQuery } from '#helpers/query_builder'
import EventType from '#models/event_type'
import EventTypeService from '#services/event_type_service'
import { paramsUUIDValidator } from '#validators/common'
import { createEventTypeValidator, updateEventTypeValidator } from '#validators/event_type'
import string from '@adonisjs/core/helpers/string'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'


export default class EventTypesController {
  /**
   * @index
   * @summary List EventTypes
   * @description Retrieve a list of type definitions and schemas for Events
   * @paramUse(sortable, filterable)
   */
  async index({ request }: HttpContext) {
    const queryData = request.qs()
    const sort = queryData['sort']
    const order = queryData['order']

    let [query, countQuery] = buildApiQuery(EventType.query(), queryData, 'event_types')

    query.preload('tags')

    if (sort && order) {
      const camelSortStr = string.camelCase(sort)
      query.orderBy(camelSortStr, order)
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
   * @store
   * @summary Create EventType
   * @description Create a new type definition and schema for Events
   */
  async store({ request }: HttpContext) {
    await request.validateUsing(createEventTypeValidator)

    return db.transaction(async (trx) => {
      const newEventType = await EventTypeService.createEventType(trx, request.body(), request.input('tags'))
      return { data: await EventTypeService.getFullEventType(newEventType.id, trx) }
    })
  }

  /**
   * @show
   * @summary Get EventType
   * @description Retrieve an individual EventType definition
   */
  async show({ params }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    return {
      data: await EventType.query().where('id', params.id).preload('tags').firstOrFail(),
    }
  }

  /**
   * @showWithEvents
   * @summary List Events of Type
   * @description Retrieve a list of Event records of a specific type
   * @paramUse(sortable, filterable)
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
   * @update
   * @summary Update EventType
   * @description Update an individual EventType definition
   */
  async update({ params, request }: HttpContext) {
    await request.validateUsing(updateEventTypeValidator)
    await paramsUUIDValidator.validate(params)

    const cleanRequest = request.only(['name', 'key', 'description'])

    return db.transaction(async (trx) => {
      const updatedEventType = await EventTypeService.updateEventType(trx, params.id, cleanRequest, request.input('tags'))
      return { data: await EventTypeService.getFullEventType(updatedEventType.id, trx) }
    })
  }

  /**
   * @destroy
   * @summary Delete EventType
   * @description Remove an individual EventType definition from this Arcwell instance
   */
  async destroy({ params, response }: HttpContext) {
    await paramsUUIDValidator.validate(params)
    const eventType = await EventType.findOrFail(params.id)
    await eventType.delete()
    response.status(204).send('')
  }
}
