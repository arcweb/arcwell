import factory from '@adonisjs/lucid/factories'
import PersonType from '#models/person_type'

export const PersonTypeFactory = factory
  .define(PersonType, async ({ faker }) => {
    return {
      key: faker.person.jobType(),
      name: faker.person.jobType(),
    }
  })
  .build()
