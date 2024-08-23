import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Person from '#models/person'
import PersonType from '#models/person_type'

test.group('Model people', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.setup(async () => {
    await PersonType.create({ key: 'Tester', name: 'Tester' })
  })

  group.teardown(async () => {
    // clean up test data
    const pTypeT = await PersonType.findBy('key', 'Tester')
    if (pTypeT) {
      pTypeT.delete()
    }
  })

  test('people create test', async (ctx) => {
    const pTypeT = await PersonType.findBy('key', 'Tester')
    const personInfo = {
      givenName: 'Bob',
      familyName: 'Test',
      personTypeId: pTypeT?.id,
    }

    const newPerson = await Person.create(personInfo)

    ctx.assert.equal(newPerson.familyName, 'Test')
    ctx.assert.equal(newPerson.givenName, 'Bob')
    ctx.assert.equal(newPerson.personTypeId, pTypeT?.id)
  })

  test('people update test', async ({ assert }) => {
    const person = await Person.first()
    const newData = {
      givenName: 'NewPerson',
    }

    person?.merge(newData).save()

    assert.equal(person?.givenName, 'NewPerson')
  })

  test('people tagging test', async ({ assert }) => {
    const pTypeT = await PersonType.findBy('key', 'Tester')
    const personInfo = {
      familyName: 'TEST',
      givenName: 'TEST',
      personTypeId: pTypeT?.id,
      tags: JSON.stringify(['first/list']),
    }

    const newPerson = await Person.create(personInfo)

    assert.equal(newPerson.tags, personInfo.tags)
  })
})
