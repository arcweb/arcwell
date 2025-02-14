import factory from '@adonisjs/lucid/factories'
import Group from '#models/group'

export const GroupFactory = factory
  .define(Group, async ({ faker }) => {
    const name = faker.string.alphanumeric(20)
    return {
      name: name,
    }
  })
  .build()
