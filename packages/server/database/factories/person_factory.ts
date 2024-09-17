import factory from '@adonisjs/lucid/factories'
import Person from '#models/person'

export const PersonFactory = factory
  .define(Person, async ({ faker }) => {
    return {
      family_name: faker.person.lastName(),
      given_name: faker.person.firstName(),
    }
  })
  .build()
