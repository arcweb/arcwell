import factory from '@adonisjs/lucid/factories'
import FactType from '#models/fact_type'
import { DimensionTypeFactory } from '#database/factories/dimension_type_factory'

export const FactTypeFactory = factory
  .define(FactType, async ({ faker }) => {
    return {
      key: faker.lorem.word(),
      name: faker.lorem.word(),
      description: faker.lorem.sentence(),
    }
  })
  .relation('dimensionTypes', () => DimensionTypeFactory)
  .build()
