import factory from '@adonisjs/lucid/factories'
import Tag from '#models/tag'

export const TagFactory = factory
  .define(Tag, async ({ faker }) => {
    return {
      parent: faker.commerce.product(),
      basename: faker.commerce.productName(),
    }
  })
  .build()
