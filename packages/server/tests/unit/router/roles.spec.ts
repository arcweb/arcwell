import Role from '#models/role'
import User from '#models/user'
import { test } from '@japa/runner'

const ROLE_URL = '/roles'

test.group('Router roles', () => {
  test('role index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(ROLE_URL).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.length, 1)
    assert.equal(data.meta.count, 1)
  })

  test('role index test no auth', async ({ client }) => {
    const response = await client.get(ROLE_URL)

    response.assertStatus(401)
  })

  test('role show test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const role = await Role.first()
    const response = await client.get(`${ROLE_URL}/${role?.id}`).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, role?.id)
    assert.equal(data.data.name, role?.name)
  })

  test('role update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const role = await Role.findByOrFail('name', 'test')
    const newData = {
      name: 'new-test',
    }
    const response = await client
      .patch(`${ROLE_URL}/${role.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)
    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, role.id)
    assert.equal(data.data.name, newData.name)
  }).setup(async () => {
    // const policy = Policy.first()
    const newData = {
      name: 'test',
    }
    await Role.create(newData)
  })

  test('role destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const role = await Role.findByOrFail('name', 'new-test')
    const response = await client.delete(`${ROLE_URL}/${role.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  })
})
