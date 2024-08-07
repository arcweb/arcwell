import { test } from '@japa/runner'

import Person from '#models/person'

test.group('People', () => {
  test('create test', async ({ assert }) => {
    const personInfo = {
      givenName: 'Bob',
      familyName: 'Test',
    }

    const newPerson = await Person.create(personInfo)

    assert.equal(newPerson.familyName, 'Test')
    assert.equal(newPerson.givenName, 'Bob')
  })
})
