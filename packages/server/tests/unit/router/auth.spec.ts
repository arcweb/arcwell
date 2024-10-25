import Role from '#models/role'
import User from '#models/user'
import { test } from '@japa/runner'

const AUTH_URL = '/auth'

test.group('Router Auth', () => {
  test('auth login test', async ({ assert, client }) => {
    const loginInfo = {
      email: 'test@example.com',
      password: 'example-test-pass'
    }
    const response = await client.post(`${AUTH_URL}/login`).json({ ...loginInfo })
    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.token.type, 'bearer')
    assert.exists(data.data.token.value)
    assert.exists(data.data.token.expiresAt)
    assert.exists(data.data.user.id)
  }).setup(async () => {
    const role = await Role.findByOrFail('name', 'Admin')
    const tempUser = {
      email: 'test@example.com',
      password: 'example-test-pass',
      roleId: role.id,
    }

    await User.create(tempUser)
  })

  test('auth login bad test', async ({ client }) => {
    const loginInfo = {
      email: 'bad@example.com',
      password: 'example-test-pass-fail'
    }
    const response = await client.post(`${AUTH_URL}/login`).json({ ...loginInfo })
    response.assertStatus(404)
  })

  test('auth logout test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.delete(`${AUTH_URL}/logout`).loginAs(adminUser!)
    response.assertStatus(204)
  })

  test('auth me test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${AUTH_URL}/me`).loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
  })
})
