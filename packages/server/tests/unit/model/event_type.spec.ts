import EventType from '#models/event_type'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model event type', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('event type create test', async ({ assert }) => {
    const eventTypeInfo = {
      key: 'TEST',
      name: 'TEST',
    }

    const newEventType = await EventType.create(eventTypeInfo)

    assert.equal(newEventType.key, eventTypeInfo.key)
    assert.equal(newEventType.name, eventTypeInfo.name)
  })

  test('event type update test', async ({ assert }) => {
    const eventType = await EventType.first()
    const newData = {
      name: 'TEST',
    }

    eventType?.merge(newData).save()
    assert.equal(eventType?.name, newData.name)
  })

  test('event type tagging test', async ({ assert }) => {
    const eventTypeInfo = {
      key: 'TEST',
      name: 'TEST',
      tags: JSON.stringify(['first/list']),
    }

    const newEventType = await EventType.create(eventTypeInfo)

    assert.equal(newEventType.tags, eventTypeInfo.tags)
  })
})
