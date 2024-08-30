import Cohort from '#models/cohort'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Model Cohort', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('cohort create test', async ({ assert }) => {
    const cohortInfo = {
      name: 'Arcweb',
      description: 'The arcwebbers',
    }

    const newCohort = await Cohort.create(cohortInfo)
    assert.equal(newCohort.name, cohortInfo.name)
    assert.equal(newCohort.description, cohortInfo.description)
  })

  test('cohort update test', async ({ assert }) => {
    const cohort = await Cohort.first()
    const newData = {
      description: 'New Description',
    }

    cohort?.merge(newData).save()

    assert.equal(cohort?.description, newData.description)
  })
})
