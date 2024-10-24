import Cohort from '#models/cohort'
import Person from '#models/person'
import PersonType from '#models/person_type'
import User from '#models/user'
import { test } from '@japa/runner'

const PEOPLE_URL = '/people'

test.group('Router people', () => {
  test('people index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(PEOPLE_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 112)
    assert.equal(data.meta.count, 112)
  })

  test('people index test', async ({ client }) => {
    const response = await client.get(PEOPLE_URL)

    response.assertStatus(401)
  })

  test('people index filtered test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const pType = await PersonType.findBy('key', 'Staff')
    const response = await client.get(`${PEOPLE_URL}?personTypeId=${pType?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 112)
    assert.equal(data.meta.count, 112)
  })

  test('people index cohort test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const person = await Person.first()
    const response = await client.get(`${PEOPLE_URL}/${person?.id}/cohorts`).loginAs(adminUser! )

    response.assertStatus(200)
  })

  test('people index count test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${PEOPLE_URL}/count`).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.count, 112)
  })

  test('people attach cohort', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.first()
    const person =  await Person.findByOrFail('givenName', 'Tester')

    const cohortIds = {
      cohortIds: [cohort?.id],
    }
    const response = await client
      .post(`${PEOPLE_URL}/${person.id}/attach`)
      .json({ ...cohortIds })
      .loginAs(adminUser!)

    response.assertStatus(201)
  }).setup(async () => {
    const type = await PersonType.findBy('key', 'temp')

    const newPerson = {
      typeKey: type!.key,
      familyName: 'Newman',
      givenName: 'Tester',
    }
    await Person.create(newPerson)
  })

  test('people detach cohort', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.findByOrFail('name', 'Arcweb')
    const person =  await Person.findByOrFail('givenName', 'Tester')

    const cohortIds = {
      cohortIds: [cohort?.id],
    }
    const response = await client
      .delete(`${PEOPLE_URL}/${person.id}/detach`)
      .json({ ...cohortIds })
      .loginAs(adminUser!)

    response.assertStatus(204)
  })

  test('people show test', async ({ assert, client }) => {
    // get a valid person for id for request
    const adminUser = await User.findBy('email', 'admin@example.com')
    const person = await Person.first()

    const response = await client.get(`${PEOPLE_URL}/${person?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, person?.id)
    assert.equal(data.data.familyName, person?.familyName)
    assert.equal(data.data.givenName, person?.givenName)
  })

  test('people update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    // get a valid person for id for request
    const person = await Person.first()

    const newData = {
      givenName: 'NewPerson',
    }
    const response = await client
      .patch(`${PEOPLE_URL}/${person?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)
    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, person?.id)
    assert.equal(data.data.familyName, person?.familyName)
    assert.equal(data.data.givenName, newData.givenName)
  })

  test('people store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const type = await PersonType.findBy('key', 'tester')

    const newPerson = {
      typeKey: type!.key,
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
    assert.equal(data.data.typeKey, newPerson.typeKey)
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
    const adminUser = await User.findBy('email', 'admin@example.com')
    const person = await Person.findBy('familyName', 'Newman')

    const response = await client.delete(`${PEOPLE_URL}/${person!.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const type = await PersonType.findBy('key', 'staff')

    const newPerson = {
      typeKey: type!.key,
      familyName: 'Newman',
      givenName: 'Mike',
    }
    await Person.create(newPerson)
  })
})
