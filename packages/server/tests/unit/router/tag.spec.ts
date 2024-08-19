import Tag from '#models/tag'
import User from '#models/user'
import { test } from '@japa/runner'

const TAG_URL = '/tags'

test.group('Router tag', () => {
  test('tag index test', async ({ assert, client }) => {
    const response = await client.get(TAG_URL)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 3)
  })

  test('tag show test', async ({ assert, client }) => {
    const tag = await Tag.first()

    const response = await client.get(`${TAG_URL}/${tag?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, tag?.id)
    assert.equal(data.data.pathname, tag?.pathname)
    assert.equal(data.data.parent, tag?.parent)
    assert.equal(data.data.basename, tag?.basename)
  })

  test('tag udate test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const tag = await Tag.first()

    const newData = {
      basename: 'NewName',
    }
    const response = await client
      .put(`${TAG_URL}/${tag?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, tag?.id)
    assert.equal(data.data.basename, newData.basename)
  })

  test('tag store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')

    const newTag = {
      pathname: 'Object/big',
      parent: 'Object',
      basename: 'big',
    }
    const response = await client
      .post(`${TAG_URL}`)
      .json({ ...newTag })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.pathname, newTag.pathname)
    assert.equal(data.data.parent, newTag.parent)
    assert.equal(data.data.basename, newTag.basename)
  })

  test('tag destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const tag = await Tag.findBy('pathname', 'Object/small')

    const response = await client.delete(`${TAG_URL}/${tag?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const newTag = {
      pathname: 'Object/small',
      parent: 'Object',
      basename: 'small',
    }
    await Tag.create(newTag)
  })
})
