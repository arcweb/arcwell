import Resource from '#models/resource'
import factory from '@adonisjs/lucid/factories'

export const ResourceFactory = factory
  .define(Resource, async ({ faker }) => {
    return {
      name: faker.person.fullName(),
    }
  })
  .build()
