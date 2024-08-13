import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import ResourceType from './resource_type'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Resource extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare meta: JSON

  @column()
  declare resourceTypeId: string

  @column()
  declare tags: string[]

  @belongsTo(() => ResourceType)
  declare resourceType: BelongsTo<typeof ResourceType>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
