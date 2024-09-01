import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

import Tag from '#models/tag'

test.group('Model tag', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('tag create test', async (ctx) => {
    const tagInfo = { pathname: 'bottom/middle' }

    const newTag = await Tag.create(tagInfo)

    ctx.assert.equal(newTag.pathname, tagInfo.pathname)
  })

  test('tag update test', async ({ assert }) => {
    const tag = await Tag.first()
    const newData = {
      pathname: 'NewTag',
    }

    await tag?.merge(newData).save()

    assert.equal(tag?.pathname, 'NewTag')
  })
})
