import Fact from '#models/fact'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const FactFactory = factory
  .define(Fact, async ({ faker }) => {
    return {
      observedAt: DateTime.now(),
      tags: JSON.stringify(['diagnosis/diabetes/type1']),
    }
  })
  .build()
