import Tag from '#models/tag'
import User from '#models/user'
import { test } from '@japa/runner'

const TAG_URL = '/tags'

test.group('Router tag', () => {
  test('tag index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(TAG_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 3)
  })

  test('tag show test', async ({ assert, client }) => {
    const tag = await Tag.first()

    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(`${TAG_URL}/${tag?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, tag?.id)
    assert.equal(data.data.pathname, tag?.pathname)
  })

  test('tag update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const tag = await Tag.first()

    const newData = {
      pathname: 'NewName',
    }
    const response = await client
      .patch(`${TAG_URL}/${tag?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, tag?.id)
    assert.equal(data.data.pathname, newData.pathname)
  })

  test('tag store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')

    const newTag = {
      pathname: 'Object/big',
    }
    const response = await client
      .post(`${TAG_URL}`)
      .json({ ...newTag })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.pathname, newTag.pathname)
  })

  test('tag destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const tag = await Tag.findBy('pathname', 'Object/small')

    const response = await client.delete(`${TAG_URL}/${tag?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const newTag = {
      pathname: 'Object/small',
    }
    await Tag.create(newTag)
  })
})
