import { DateTime } from 'luxon'
import { afterDelete, BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import FactType from '#models/fact_type'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Resource from '#models/resource'
import Event from '#models/event'
import Tag from '#models/tag'

export default class Fact extends BaseModel {
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
  declare dimensions: Object

  @column()
  declare meta: Object

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
}
