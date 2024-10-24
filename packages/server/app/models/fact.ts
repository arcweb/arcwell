import { DateTime } from 'luxon'
import { afterDelete, beforeSave, belongsTo, column, manyToMany, scope } from '@adonisjs/lucid/orm'
import FactType from '#models/fact_type'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Resource from '#models/resource'
import Event from '#models/event'
import Tag from '#models/tag'
import Dimension from '#models/dimension'
import AwBaseModel from '#models/aw_base_model'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Fact extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare typeKey: string

  @column()
  declare personId: string

  @column()
  declare resourceId: string

  @column()
  declare eventId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime()
  declare observedAt: DateTime

  @column()
  declare info: Object

  @column()
  declare dimensions: Dimension[]

  @belongsTo(() => FactType, { foreignKey: 'typeKey', localKey: 'key' })
  declare factType: BelongsTo<typeof FactType>

  @belongsTo(() => Person)
  declare person: BelongsTo<typeof Person>

  @belongsTo(() => Resource)
  declare resource: BelongsTo<typeof Resource>

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @afterDelete()
  static async detachTags(fact: Fact) {
    await fact.related('tags').detach()
  }

  @beforeSave()
  static async generateJson(fact: Fact) {
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (fact.dimensions && typeof fact.dimensions !== 'string') {
      // @ts-ignore - ignoring because dimensions have to be stringify-ed to get around knex & postgresql jsonb issue
      fact.dimensions = JSON.stringify(fact.dimensions)
    }
  }

  static fullFact = scope((query: ModelQueryBuilderContract<typeof Fact>) => {
    query
      .preload('factType')
      .preload('tags')
      .preload('person', (personQuery) => {
        personQuery.preload('tags')
        personQuery.preload('user', (userQuery) => {
          userQuery.preload('tags')
        })
      })
      .preload('resource', (resourceQuery) => {
        resourceQuery.preload('tags')
      })
      .preload('event', (eventQuery) => {
        eventQuery.preload('tags')
      })
  })
}
