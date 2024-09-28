import Fact from '#models/fact'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const FactFactory = factory
  .define(Fact, async ({}) => {
    return {
      observedAt: DateTime.now(),
    }
  })
  .build()
