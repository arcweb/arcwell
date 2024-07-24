import factory from '@adonisjs/lucid/factories'
import Role from '#models/role'
import { PolicyFactory } from '#database/factories/policy_factory'

export const RoleFactory = factory
  .define(Role, async ({ faker }) => {
    return {
      name: faker.commerce.productName(),
    }
  })
  .relation('policies', () => PolicyFactory)
  .build()
