import Event from '#models/event'
import factory from '@adonisjs/lucid/factories'

export const EventFactory = factory
  .define(Event, async ({}) => {
    return {}
  })
  .build()
