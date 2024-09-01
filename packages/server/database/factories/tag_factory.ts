import factory from '@adonisjs/lucid/factories'
import Tag from '#models/tag'

export const TagFactory = factory
  .define(Tag, async ({ faker }) => {
    const pathname =
      faker.commerce.product() +
      '/' +
      faker.string.alphanumeric(10) +
      '/' +
      faker.commerce.productName()
    return {
      pathname: pathname,
    }
  })
  .build()
