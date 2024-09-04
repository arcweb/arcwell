import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import FactType from '#models/fact_type'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Resource from '#models/resource'
import Event from '#models/event'

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

  @column()
  declare tags: string[]

  @belongsTo(() => FactType, { foreignKey: 'typeKey', localKey: 'key' })
  declare factType: BelongsTo<typeof FactType>

  @belongsTo(() => Person)
  declare person: BelongsTo<typeof Person>

  @belongsTo(() => Resource)
  declare resource: BelongsTo<typeof Resource>

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>
}
