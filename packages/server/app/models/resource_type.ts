import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Resource from './resource'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class ResourceType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare tags: string[]

  @hasMany(() => Resource)
  declare resources: HasMany<typeof Resource>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
