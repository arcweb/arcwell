import factory from '@adonisjs/lucid/factories'
import Dimension from '#models/dimension'

export const DimensionFactory = factory
  .define(Dimension, async ({ faker }) => {
    return {
      key: faker.commerce.productName(),
      value: faker.commerce.productMaterial(),
    }
  })
  .build()
