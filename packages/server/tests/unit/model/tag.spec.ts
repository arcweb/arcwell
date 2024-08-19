import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Tag from '#models/tag'

test.group('Model people', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('tag create test', async (ctx) => {
    const tagInfo = { pathname: 'bottom/middle', parent: 'bottom', basename: 'middle' }

    const newTag = await Tag.create(tagInfo)

    ctx.assert.equal(newTag.pathname, tagInfo.pathname)
    ctx.assert.equal(newTag.parent, tagInfo.parent)
    ctx.assert.equal(newTag.basename, tagInfo.basename)
  })

  test('people update test', async ({ assert }) => {
    const tag = await Tag.first()
    const newData = {
      basename: 'NewTag',
    }

    tag?.merge(newData).save()

    assert.equal(tag?.basename, 'NewTag')
  })
})
