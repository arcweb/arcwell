import EventType from '#models/event_type'
import User from '#models/user'
import { test } from '@japa/runner'

const EVENT_TYPE_URL = '/event_types'

test.group('Router event type', () => {
  test('event type index test', async ({ assert, client }) => {
    const response = await client.get(`${EVENT_TYPE_URL}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 2)
  })

  test('event type show test', async ({ assert, client }) => {
    const eventType = await EventType.first()

    const response = await client.get(`${EVENT_TYPE_URL}/${eventType?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, eventType?.id)
    assert.equal(data.data.key, eventType?.key)
    assert.equal(data.data.name, eventType?.name)
  })

  test('event type show with events test', async ({ assert, client }) => {
    const eventType = await EventType.findBy('key', 'appt')

    const response = await client.get(`${EVENT_TYPE_URL}/${eventType?.id}/events`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, eventType?.id)
    assert.equal(data.data.key, eventType?.key)
    assert.equal(data.data.name, eventType?.name)
    assert.equal(data.data.events.length, 6)
  })

  test('event type update test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')
    const eventType = await EventType.first()

    const newData = {
      name: 'New Name',
    }

    const response = await client
      .put(`${EVENT_TYPE_URL}/${eventType?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.equal(data.data.id, eventType?.id)
    assert.equal(data.data.name, newData.name)
  })

  test('event type store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')

    const newRType = {
      key: 'test',
      name: 'Test',
    }
    const response = await client
      .post(`${EVENT_TYPE_URL}`)
      .json({ ...newRType })
      .loginAs(adminUser!)

    response.assertStatus(200)
    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.key, newRType.key)
    assert.equal(data.data.name, newRType.name)
  })

  test('event type delete type', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@example.com')
    const eventType = await EventType.findBy('key', 'newtest')

    const response = await client.delete(`${EVENT_TYPE_URL}/${eventType?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const newRType = {
      key: 'newtest',
      name: 'New Test',
    }
    await EventType.create(newRType)
  })
})
