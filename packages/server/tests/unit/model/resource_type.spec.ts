import ResourceType from '#models/resource_type'
import { test } from '@japa/runner'

test.group('Model resource type', (group) => {
  test('resource type create test', async ({ assert }) => {
    const resourceTypeInfo = {
      key: 'TEST',
      name: 'TEST',
    }

    const newResourceType = await ResourceType.create(resourceTypeInfo)

    assert.equal(newResourceType.key, resourceTypeInfo.key)
    assert.equal(newResourceType.name, resourceTypeInfo.name)
  })

  test('resource type update test', async({ assert }) => {
    const resourceType = await ResourceType.first()
    const newData = {
      name: 'TEST',
    }

    resourceType?.merge(newData).save()
    assert.equal(resourceType?.name, newData.name)
  })
})
