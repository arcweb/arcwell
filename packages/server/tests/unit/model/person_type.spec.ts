import PersonType from '#models/person_type'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model person type', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  test('person type create test', async ({ assert }) => {
    const personTypeInfo = {
      key: 'TEST',
      name: 'TEST',
    }

    const newPersonType = await PersonType.create(personTypeInfo)

    assert.equal(newPersonType.key, personTypeInfo.key)
    assert.equal(newPersonType.name, personTypeInfo.name)
  })

  test('person type update test', async({ assert }) => {
    const personType = await PersonType.first()
    const newData = {
      name: 'TEST',
    }

    personType?.merge(newData).save()
    assert.equal(personType?.name, newData.name)
  })
})
