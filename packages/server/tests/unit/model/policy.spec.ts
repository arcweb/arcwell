import Policy from '#models/policy'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model Policy', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('policy create test', async ({ assert }) => {
    const policyInfo = {
      name: 'test',
      capabilities: JSON.stringify('things the policy can do'),
    }

    const newPolicy = await Policy.create(policyInfo)
    assert.equal(newPolicy.name, policyInfo.name)
    assert.equal(newPolicy.capabilities, policyInfo.capabilities)
  })

  test('policy update test', async ({ assert }) => {
    const policy = await Policy.first()
    const newData = {
      name: 'new name',
    }

    policy?.merge(newData).save()

    assert.equal(policy?.name, newData.name)
  })
})
