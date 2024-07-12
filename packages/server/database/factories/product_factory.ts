import factory from '@adonisjs/lucid/factories'
import Product from '#models/product'

export const ProductFactory = factory
  .define(Product, async ({ faker }) => {
    return {
      name: faker.commerce.productName(),
      productNumber: faker.string.alphanumeric({length: 15}),
      standardCost: faker. number. float({ min: 0, max: 999999, fractionDigits: 2 }),
      color: faker.color.human()
    }
  })
  .build()
