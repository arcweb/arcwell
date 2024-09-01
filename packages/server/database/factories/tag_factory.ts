import factory from '@adonisjs/lucid/factories'
import Tag from '#models/tag'

export const TagFactory = factory
  .define(Tag, async ({ faker }) => {
    const parent = faker.commerce.product() + '/' + faker.string.alphanumeric(10)
    const basename = faker.commerce.productName()
    const pathname = parent + '/' + basename
    return {
      pathname: pathname,
      parent: parent,
      basename: basename,
    }
  })
  .build()
