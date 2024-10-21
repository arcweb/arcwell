import factory from '@adonisjs/lucid/factories'
import FactType from '#models/fact_type'

export const FactTypeFactory = factory
  .define(FactType, async ({ faker }) => {
    return {
      key: faker.lorem.word(),
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
    }
  })
  .build()
