import Resource from '#models/resource'
import ResourceType from '#models/resource_type'
import User from '#models/user'
import { test } from '@japa/runner'

const RESOURCE_URL = '/resources'

test.group('Router resource', () => {
  test('resource index test', async ({ assert, client }) => {
    const response = await client.get(RESOURCE_URL)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 5)
  })

  test('resource show test', async ({ assert, client }) => {
    const resource = await Resource.first()

    const response = await client.get(`${RESOURCE_URL}/${resource?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, resource?.id)
    assert.equal(data.data.name, resource?.name)
  })

  test('resource udate test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const resource = await Resource.first()

    const newData = {
      name: 'NewName',
    }
    const response = await client
      .put(`${RESOURCE_URL}/${resource?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, resource?.id)
    assert.equal(data.data.name, newData.name)
  })

  test('resource store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const type = await ResourceType.findBy('key', 'tester')

    const newRresource = {
      resourceTypeId: type!.id,
      name: 'Object',
    }
    const response = await client
      .post(`${RESOURCE_URL}`)
      .json({ ...newRresource })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.resourceTypeId, newRresource.resourceTypeId)
    assert.equal(data.data.name, newRresource.name)
  })
    .setup(async () => {
      await ResourceType.create({ key: 'tester', name: 'Tester' })
    })
    .teardown(async () => {
      const resource = await Resource.findBy('name', 'Object')
      if (resource) {
        resource.delete()
      }
      const rTypeT = await ResourceType.findBy('key', 'tester')
      if (rTypeT) {
        rTypeT.delete()
      }
    })

  test('resource destroy test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const resource = await Resource.findBy('name', 'Object')

    const response = await client.delete(`${RESOURCE_URL}/${resource?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const type = await ResourceType.findBy('key', 'dme')

    const newRresource = {
      resourceTypeId: type!.id,
      name: 'Object',
    }
    await Resource.create(newRresource)
  })
})
