import factory from '@adonisjs/lucid/factories'
import DimensionType from '#models/dimension_type'
import { FactTypeFactory } from '#database/factories/fact_type_factory'

export const DimensionTypeFactory = factory
  .define(DimensionType, async ({ faker }) => {
    return {
      key: faker.lorem.word(),
      name: faker.lorem.word(),
      dataType: faker.database.type(),
      dataUnit: faker.science.unit().name,
    }
  })
  .relation('factTypes', () => FactTypeFactory)
  .build()
