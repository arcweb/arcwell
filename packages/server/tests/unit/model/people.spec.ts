import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Person from '#models/person'
import PersonType from '#models/person_type'
import Tag from '#models/tag'

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
      typeKey: pTypeT?.key,
    }

    const newPerson = await Person.create(personInfo)

    ctx.assert.equal(newPerson.familyName, 'Test')
    ctx.assert.equal(newPerson.givenName, 'Bob')
    ctx.assert.equal(newPerson.typeKey, pTypeT?.key)
  })

  test('people update test', async ({ assert }) => {
    const person = await Person.first()
    const newData = {
      givenName: 'NewPerson',
    }

    person?.merge(newData).save()

    assert.equal(person?.givenName, 'NewPerson')
  })

  // We no longer use model level taggin, the controler uses raw SQl
  // test('people tagging test', async ({ assert }) => {
  //   const person = await Person.firstOrFail()
  //   const tag = await Tag.firstOrFail()

  //   await person.related('tags').attach([tag.id])
  //   assert.equal(person.tags, tag.id)
  // })
})
