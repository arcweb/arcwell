import Cohort from '#models/cohort'
import Person from '#models/person'
import PersonType from '#models/person_type'
import User from '#models/user'
import { test } from '@japa/runner'

const COHORT_URL = '/cohorts'

test.group('Router cohort', () => {
  test('cohort index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(COHORT_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 1)
    assert.equal(data.meta.count, 1)
  })

  test('cohort index test no auth', async ({ client }) => {
    const response = await client.get(COHORT_URL)

    response.assertStatus(401)
  })

  test('cohort index with people test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.first()
    const response = await client.get(`${COHORT_URL}/${cohort?.id}/people`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.people.length, 10)
  })

  test('cohort show test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.first()
    const response = await client.get(`${COHORT_URL}/${cohort?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.name, 'Arcweb')
  })

  test('cohort update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.findByOrFail('name', 'tester')
    const newData = {
      name: 'newName',
    }

    const response = await client
      .patch(`${COHORT_URL}/${cohort.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)
    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, cohort.id)
    assert.equal(data.data.name, newData.name)
  }).setup(async () => {
    const testCohort = {
      name: 'tester'
    }
    await Cohort.create(testCohort)
  })

  test('cohort attach person', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.findByOrFail('name', 'tester')
    const person =  await Person.findByOrFail('givenName', 'Tester')

    const personIds = {
      peopleIds: [person.id]
    }
    const response = await client
      .post(`${COHORT_URL}/${cohort.id}/attach`)
      .json({ ...personIds })
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

    const testCohort = {
      name: 'tester'
    }
    await Cohort.create(testCohort)
  })

  test('cohort detach test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.findByOrFail('name', 'tester')
    const person =  await Person.findByOrFail('givenName', 'Tester')

    const personIds = {
      peopleIds: [person.id]
    }
    const response = await client
      .delete(`${COHORT_URL}/${cohort.id}/detach`)
      .json({ ...personIds })
      .loginAs(adminUser!)

    response.assertStatus(204)
  })

  test('cohort destroy test', async ({ assert, client}) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const cohort = await Cohort.findByOrFail('name', 'deleter')

    const response = await client.delete(`${COHORT_URL}/${cohort.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const testCohort = {
      name: 'deleter'
    }
    await Cohort.create(testCohort)
  })
})
