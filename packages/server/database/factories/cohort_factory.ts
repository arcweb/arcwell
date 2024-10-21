import Cohort from '#models/cohort'
import factory from '@adonisjs/lucid/factories'
import { PersonFactory } from '#database/factories/person_factory'

export const CohortFactory = factory
  .define(Cohort, async ({ faker }) => {
    return {
      name: faker.commerce.department(),
      description: faker.lorem.paragraph(),
    }
  })
  .relation('people', () => PersonFactory)
  .build()
