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
      name: 'Object',
      typeKey: eTypeT?.key,
      source: 'epic',
    }

    const newEvent = await Event.create(eventInfo)
    assert.equal(newEvent.name, 'Object')
    assert.equal(newEvent.typeKey, eTypeT?.key)
    assert.equal(newEvent.source, 'epic')
  })

  test('event update test', async ({ assert }) => {
    const event = await Event.first()
    const newData = {
      name: 'New Object',
    }

    event?.merge(newData).save()

    assert.equal(event?.name, 'New Object')
  })

  test('event tagging test', async ({ assert }) => {
    const eTypeT = await EventType.findBy('key', 'tester')
    const eventInfo = {
      name: 'TEST',
      typeKey: eTypeT?.key,
      tags: JSON.stringify(['first/list']),
      source: 'epic',
    }

    const newEvent = await Event.create(eventInfo)

    assert.equal(newEvent.tags, eventInfo.tags)
  })
})
