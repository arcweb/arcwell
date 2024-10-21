import factory from '@adonisjs/lucid/factories'
import Policy from '#models/policy'
import { RoleFactory } from '#database/factories/role_factory'

export const PolicyFactory = factory
  .define(Policy, async ({ faker }) => {
    return {
      name: faker.commerce.productName(),
      capabilities: '{}',
    }
  })
  .relation('roles', () => RoleFactory)
  .build()
