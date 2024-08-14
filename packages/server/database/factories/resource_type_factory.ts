import ResourceType from '#models/resource_type'
import factory from '@adonisjs/lucid/factories'

export const ResourceTypeFactory = factory
  .define(ResourceType, async ({ faker }) => {
    return {
      key: faker.commerce.product(),
      name: faker.commerce.product(),
    }
  })
  .build()
