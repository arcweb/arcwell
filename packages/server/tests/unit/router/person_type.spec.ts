import PersonType from '#models/person_type'
import User from '#models/user'
import { test } from '@japa/runner'

const PERSON_TYPE_URL = '/person_types'

test.group('Router person type', () => {
  test('person type index test', async ({ assert, client }) => {
    const response = await client.get(`${PERSON_TYPE_URL}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 3)
  })

  test('person type show test', async ({ assert, client }) => {
    const personType = await PersonType.first()

    const response = await client.get(`${PERSON_TYPE_URL}/${personType?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, personType?.id)
    assert.equal(data.data.key, personType?.key)
    assert.equal(data.data.name, personType?.name)
  })

  test('person type show with people test', async ({ assert, client }) => {
    const personType = await PersonType.findBy('key', 'Staff')

    const response = await client.get(`${PERSON_TYPE_URL}/${personType?.id}/people`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, personType?.id)
    assert.equal(data.data.key, personType?.key)
    assert.equal(data.data.name, personType?.name)
    assert.equal(data.data.people.length, 14)
  })

  test('person type update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')
    const personType = await PersonType.first()

    const newData = {
      name: 'New Name',
    }

    const response = await client
      .put(`${PERSON_TYPE_URL}/${personType?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, personType?.id)
    assert.equal(data.data.name, newData.name)
  })

  test('person type store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')

    const newRType = {
      key: 'test',
      name: 'Test',
    }
    const response = await client
      .post(`${PERSON_TYPE_URL}`)
      .json({ ...newRType })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.key, newRType.key)
    assert.equal(data.data.name, newRType.name)
  })

  test('person type delete type', async ({ client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')
    const personType = await PersonType.findBy('key', 'newtest')

    const response = await client.delete(`${PERSON_TYPE_URL}/${personType?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const newPType = {
      key: 'newtest',
      name: 'New Test',
    }
    await PersonType.create(newPType)
  })
})
