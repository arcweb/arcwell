import { DateTime } from 'luxon'
import { afterDelete, BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import EventType from '#models/event_type'
import Fact from '#models/fact'
import Tag from '#models/tag'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare source: string

  @column()
  declare info: Object | null

  @column()
  declare typeKey: string

  @belongsTo(() => EventType, { foreignKey: 'typeKey', localKey: 'key' })
  declare eventType: BelongsTo<typeof EventType>

  @column.dateTime()
  declare occurredAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Fact)
  declare facts: HasMany<typeof Fact>

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @afterDelete()
  static async detachTags(event: Event) {
    await event.related('tags').detach()
  }
}
