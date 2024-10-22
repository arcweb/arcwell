import factory from '@adonisjs/lucid/factories'
import Person from '#models/person'

export const PersonFactory = factory
  .define(Person, async ({ faker }) => {
    return {
      familyName: faker.person.lastName(),
      givenName: faker.person.firstName(),
    }
  })
  .build()
