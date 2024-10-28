import User from '#models/user'
import { test } from '@japa/runner'

const CONFIG_URL = '/config'

test.group('Router config', () => {
  test('config get test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(CONFIG_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    console.log(data)
    assert.exists(data.arcwell)
    assert.exists(data.mail)
  })

  test('config features-menu test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${CONFIG_URL}/features-menu`).loginAs(adminUser!)

    response.assertStatus(200)
  })
})
