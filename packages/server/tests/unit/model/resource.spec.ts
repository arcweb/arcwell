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
      typeKey: rTypeT?.key,
    }

    const newResource = await Resource.create(resourceInfo)
    assert.equal(newResource.name, 'Object')
    assert.equal(newResource.typeKey, rTypeT?.key)
  })

  test('resource update test', async ({ assert }) => {
    const resource = await Resource.first()
    const newData = {
      name: 'New Object',
    }

    resource?.merge(newData).save()

    assert.equal(resource?.name, 'New Object')
  })

  // We no longer use model level taggin, the controler uses raw SQl
  // test('resource tagging test', async ({ assert }) => {
  //   const rTypeT = await ResourceType.findBy('key', 'tester')
  //   const resourceInfo = {
  //     name: 'TEST',
  //     typeKey: rTypeT?.key,
  //     tags: JSON.stringify(['first/list']),
  //   }

  //   const newResource = await Resource.create(resourceInfo)

  //   assert.equal(newResource.tags, resourceInfo.tags)
  // })
})
