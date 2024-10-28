import Event from '#models/event'
import EventType from '#models/event_type'
import User from '#models/user'
import { test } from '@japa/runner'

const EVENT_URL = `/events`

test.group('Router event', () => {
  test('event index test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const response = await client.get(EVENT_URL).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 106)
  })

  test('event index filtered test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const eType = await EventType.findBy('key', 'appt')
    const response = await client.get(`${EVENT_URL}?eventTypeId=${eType?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.length, 106)
    assert.equal(data.meta.count, 106)
  })

  test('event show test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const event = await Event.first()

    const response = await client.get(`${EVENT_URL}/${event?.id}`).loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.equal(data.data.id, event?.id)
    assert.equal(data.data.typeKey, event?.typeKey)
  })

  // Test no longer valid
  // TODO: rewrite update tests for events
  // test('event udate test', async ({ assert, client }) => {
  //   const adminUser = await User.findBy('email', 'admin@example.com')
  //   const event = await Event.first()

  //   const newData = {
  //     name: 'NewName',
  //   }
  //   const response = await client
  //     .patch(`${EVENT_URL}/${event?.id}`)
  //     .json({ ...newData })
  //     .loginAs(adminUser!)

  //   response.assertStatus(200)

  //   const data = response.body()
  //   assert.equal(data.data.id, event?.id)
  //   assert.equal(data.data.name, newData.name)
  // })

  test('event store test', async ({ assert, client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const type = await EventType.findBy('key', 'tester')

    const newEvent = {
      typeKey: type!.key,
    }
    const response = await client
      .post(`${EVENT_URL}`)
      .json({ ...newEvent })
      .loginAs(adminUser!)

    response.assertStatus(200)

    const data = response.body()
    assert.exists(data.data.id)
    assert.equal(data.data.typeKey, newEvent.typeKey)
  })
    .setup(async () => {
      await EventType.create({ key: 'tester', name: 'Tester' })
    })
    .teardown(async () => {
      const event = await Event.findBy('typeKey', 'tester')
      if (event) {
        event.delete()
      }
      const rTypeT = await EventType.findBy('key', 'tester')
      if (rTypeT) {
        rTypeT.delete()
      }
    })

  test('event destroy test', async ({ client }) => {
    const adminUser = await User.findBy('email', 'admin@example.com')
    const event = await Event.findBy('typeKey', 'appointment')

    const response = await client.delete(`${EVENT_URL}/${event?.id}`).loginAs(adminUser!)
    response.assertStatus(204)
  }).setup(async () => {
    const type = await EventType.findBy('key', 'appointment')

    const newEvent = {
      typeKey: type!.key,
    }
    await Event.create(newEvent)
  })
})
