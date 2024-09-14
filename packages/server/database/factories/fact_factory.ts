import Fact from '#models/fact'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { DimensionFactory } from '#database/factories/dimension'

export const FactFactory = factory
  .define(Fact, async ({}) => {
    return {
      observedAt: DateTime.now(),
    }
  })
  .relation('dimensions', () => DimensionFactory)
  .build()
