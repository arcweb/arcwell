import Role from '#models/role'
import User from '#models/user'
import { test } from '@japa/runner'

const USER_URL = '/users'

test.group('Router users', () => {
  test('user index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(USER_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 2)
    assert.equal(data.meta.count, 2)
  })

  test('user index test no auth', async ({ client }) => {
    const response = await client.get(USER_URL)

    response.assertStatus(401)
  })

  test('user show test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${USER_URL}/${adminUser?.id}`).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, adminUser?.id)
    assert.equal(data.data.email, adminUser?.email)
  })

  test('user update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const user = await User.findByOrFail('email', 'test-2@example.com')
    const newData = {
      email: 'test-2@example.com',
      password: 'different-pass',
    }

    const response = await client
      .patch(`${USER_URL}/${user.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)
    response.assertStatus(200)

    const data = response.body()
    assert.notEqual(data.data.password, user.password)
  })
    .setup(async () => {
      const role = await Role.findByOrFail('name', 'Admin')
      const tempUser = {
        email: 'test-2@example.com',
        password: 'example-test-pass',
        roleId: role.id,
      }

      await User.create(tempUser)
    })
    .teardown(async () => {
      const user = await User.findByOrFail('email', 'test-2@example.com')
      user.delete()
    })

  test('user destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const user = await User.findByOrFail('email', 'test-3@example.com')
    const response = await client.delete(`${USER_URL}/${user.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const role = await Role.findByOrFail('name', 'Admin')
    const tempUser = {
      email: 'test-3@example.com',
      password: 'example-test-pass',
      roleId: role.id,
    }

    await User.create(tempUser)
  })
})
