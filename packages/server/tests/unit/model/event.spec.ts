import Event from '#models/event'
import EventType from '#models/event_type'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model event', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.setup(async () => {
    await EventType.create({ key: 'tester', name: 'Tester' })
  })

  group.teardown(async () => {
    // clean up test data
    const eTypeT = await EventType.findBy('key', 'tester')
    if (eTypeT) {
      eTypeT.delete()
    }
  })

  test('event create test', async ({ assert }) => {
    const eTypeT = await EventType.findBy('key', 'tester')
    const eventInfo = {
      typeKey: eTypeT?.key,
      dimensions: [{ key: 'weight', value: 123 }],
    }

    const newEvent = await Event.create(eventInfo)
    assert.equal(newEvent.typeKey, eTypeT?.key)
  })

  test('event update test', async ({ assert }) => {
    const event = await Event.first()
    const newData = {
      dimensions: [{ key: 'weight', value: 1234 }],
    }

    event?.merge(newData).save()

    assert.equal(event?.dimensions, newData.dimensions)
  })
})
