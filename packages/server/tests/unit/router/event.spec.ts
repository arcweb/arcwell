import Event from '#models/event'
import EventType from '#models/event_type'
import User from '#models/user'
import { test } from '@japa/runner'

const EVENT_URL = '/events'

test.group('Router event', () => {
  test('event index test', async ({ assert, client }) => {
    const response = await client.get(EVENT_URL)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 10)
  })

  test('event index filtered test', async ({ assert, client }) => {
    const eType = await EventType.findBy('key', 'appt')
    const response = await client.get(`${EVENT_URL}?eventTypeId=${eType?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 5)
    assert.equal(data.meta.count, 5)
  })

  test('event show test', async ({ assert, client }) => {
    const event = await Event.first()

    const response = await client.get(`${EVENT_URL}/${event?.id}`)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, event?.id)
    assert.equal(data.data.name, event?.name)
    assert.equal(data.data.source, event?.source)
  })

  test('event udate test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const event = await Event.first()

    const newData = {
      name: 'NewName',
    }
    const response = await client
      .put(`${EVENT_URL}/${event?.id}`)
      .json({ ...newData })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, event?.id)
    assert.equal(data.data.name, newData.name)
  })

  test('event store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const type = await EventType.findBy('key', 'tester')

    const newEvent = {
      eventTypeId: type!.id,
      name: 'Object',
      source: 'epic',
    }
    const response = await client
      .post(`${EVENT_URL}`)
      .json({ ...newEvent })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.eventTypeId, newEvent.eventTypeId)
    assert.equal(data.data.name, newEvent.name)
    assert.equal(data.data.source, newEvent.source)
  })
    .setup(async () => {
      await EventType.create({ key: 'tester', name: 'Tester' })
    })
    .teardown(async () => {
      const event = await Event.findBy('name', 'Object')
      if (event) {
        event.delete()
      }
      const rTypeT = await EventType.findBy('key', 'tester')
      if (rTypeT) {
        rTypeT.delete()
      }
    })

  test('event destroy test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'dev-admin@email.com')
    const event = await Event.findBy('name', 'Object')

    const response = await client.delete(`${EVENT_URL}/${event?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const type = await EventType.findBy('key', 'appt')

    const newEvent = {
      eventTypeId: type!.id,
      name: 'Object',
      source: 'epic',
    }
    await Event.create(newEvent)
  })
})
