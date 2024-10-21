import EventType from '#models/event_type'
import factory from '@adonisjs/lucid/factories'

export const EventTypeFactory = factory
  .define(EventType, async ({ faker }) => {
    return {
      key: faker.commerce.product(),
      name: faker.commerce.product(),
    }
  })
  .build()
