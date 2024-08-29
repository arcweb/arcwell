import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import EventType from '#models/event_type'
import Fact from '#models/fact'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare source: string

  @column()
  declare meta: Object | null

  @column()
  declare typeKey: string

  @column()
  declare tags: string[]

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
}
