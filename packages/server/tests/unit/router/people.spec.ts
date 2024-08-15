import Person from '#models/person'
import PersonType from '#models/person_type'
import User from '#models/user'
import { test } from '@japa/runner'

const PEOPLE_URL = '/people'

test.group('Router people', () => {
  test('people index test', async ({ assert, client }) => {
    const response = await client.get(PEOPLE_URL)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 103)
  })

  test('people show test', async ({ assert, client }) => {
    // get a valid person for id for request
    const person = await Person.first()

    const response = await client.get(`${PEOPLE_URL}/${person?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, person?.id)
    assert.equal(data.data.familyName, person?.familyName)
    assert.equal(data.data.givenName, person?.givenName)
  })

  test('people update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    // get a valid person for id for request
    const person = await Person.first()

    const newData = {
      givenName: 'NewPerson',
    }
    const response = await client
      .put(`${PEOPLE_URL}/${person?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)
    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, person?.id)
    assert.equal(data.data.familyName, person?.familyName)
    assert.equal(data.data.givenName, newData.givenName)
  })

  test('people store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const type = await PersonType.findBy('key', 'tester')

    const newPerson = {
      personTypeId: type!.id,
      familyName: 'Newman',
      givenName: 'Mike',
    }
    const response = await client
      .post(`${PEOPLE_URL}`)
      .json({ ...newPerson })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.personTypeId, newPerson.personTypeId)
    assert.equal(data.data.familyName, newPerson.familyName)
    assert.equal(data.data.givenName, newPerson.givenName)
  })
    .setup(async () => {
      await PersonType.create({ key: 'tester', name: 'Tester' })
    })
    .teardown(async () => {
      const person = await Person.findBy('familyName', 'Newman')
      if (person) {
        person.delete()
      }
      const pTypeT = await PersonType.findBy('key', 'tester')
      if (pTypeT) {
        pTypeT.delete()
      }
    })

  test('people destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const person = await Person.findBy('familyName', 'Newman')

    const response = await client.delete(`${PEOPLE_URL}/${person!.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const type = await PersonType.findBy('key', 'Staff')

    const newPerson = {
      personTypeId: type!.id,
      familyName: 'Newman',
      givenName: 'Mike',
    }
    await Person.create(newPerson)
  })
})
