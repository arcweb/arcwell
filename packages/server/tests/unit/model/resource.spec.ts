import Resource from '#models/resource'
import ResourceType from '#models/resource_type'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model resource', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.setup(async () => {
    await ResourceType.create({ key: 'tester', name: 'Tester' })
  })

  group.teardown(async () => {
    // clean up test data
    const rTypeT = await ResourceType.findBy('key', 'tester')
    if (rTypeT) {
      rTypeT.delete()
    }
  })

  test('resource create test', async ({ assert }) => {
    const rTypeT = await ResourceType.findBy('key', 'tester')
    const resourceInfo = {
      name: 'Object',
      resourceTypeId: rTypeT?.id,
    }

    const newResource = await Resource.create(resourceInfo)
    assert.equal(newResource.name, 'Object')
    assert.equal(newResource.resourceTypeId, rTypeT?.id)
  })

  test('resource update test', async ({ assert }) => {
    const resource = await Resource.first()
    const newData = {
      name: 'New Object',
    }

    resource?.merge(newData).save()

    assert.equal(resource?.name, 'New Object')
  })

  test('resource tagging test', async ({ assert }) => {
    const rTypeT = await ResourceType.findBy('key', 'tester')
    const resourceInfo = {
      name: 'TEST',
      resourceTypeId: rTypeT?.id,
      tags: JSON.stringify(['first/list']),
    }

    const newResource = await Resource.create(resourceInfo)

    assert.equal(newResource.tags, resourceInfo.tags)
  })
})
