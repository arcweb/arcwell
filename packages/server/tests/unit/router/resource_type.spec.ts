import ResourceType from '#models/resource_type'
import User from '#models/user'
import { test } from '@japa/runner'

const RESOURCE_TYPE_URL = '/resource_types'

test.group('Router resource type', () => {
  test('resource type index test', async ({ assert, client }) => {
    const response = await client.get(`${RESOURCE_TYPE_URL}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 2)
  })

  test('resource type show test', async ({ assert, client }) => {
    const resourceType = await ResourceType.first()

    const response = await client.get(`${RESOURCE_TYPE_URL}/${resourceType?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, resourceType?.id)
    assert.equal(data.data.key, resourceType?.key)
    assert.equal(data.data.name, resourceType?.name)
  })

  test('resource type show with resources test', async ({ assert, client }) => {
    const resourceType = await ResourceType.findBy('key', 'device')

    const response = await client.get(`${RESOURCE_TYPE_URL}/${resourceType?.id}/resources`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, resourceType?.id)
    assert.equal(data.data.key, resourceType?.key)
    assert.equal(data.data.name, resourceType?.name)
    assert.equal(data.data.resources.length, 5)
  })

  test('resource type update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const resourceType = await ResourceType.first()

    const newData = {
      key: 'newkey',
      name: 'New Name',
    }

    const response = await client
      .put(`${RESOURCE_TYPE_URL}/${resourceType?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, resourceType?.id)
    assert.equal(data.data.key, newData.key)
    assert.equal(data.data.name, newData.name)
  })

  test('resource type store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')

    const newRType = {
      key: 'test',
      name: 'Test',
    }
    const response = await client
      .post(`${RESOURCE_TYPE_URL}`)
      .json({ ...newRType })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.key, newRType.key)
    assert.equal(data.data.name, newRType.name)
  })

  test('resource type delete type', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const resourceType = await ResourceType.findBy('key', 'newtest')

    const response = await client
      .delete(`${RESOURCE_TYPE_URL}/${resourceType?.id}`)
      .loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const newRType = {
      key: 'newtest',
      name: 'New Test',
    }
    await ResourceType.create(newRType)
  })
})
