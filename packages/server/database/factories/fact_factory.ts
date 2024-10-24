import Fact from '#models/fact'
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { TagFactory } from '#database/factories/tag_factory'

export const FactFactory = factory
  .define(Fact, async ({}) => {
    return {
      observedAt: DateTime.now(),
    }
  })
  .relation('tags', () => TagFactory)
  .build()
