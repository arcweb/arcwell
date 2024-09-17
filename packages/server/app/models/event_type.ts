import { DateTime } from 'luxon'
import {
  afterDelete,
  BaseModel,
  beforeSave,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'
import Tag from '#models/tag'
import { generateTypeKey } from '#helpers/generate_type_key'

export default class EventType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => Event, { foreignKey: 'typeKey', localKey: 'key' })
  declare events: HasMany<typeof Event>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @afterDelete()
  static async detachTags(eventType: EventType) {
    await eventType.related('tags').detach()
  }

  @beforeSave()
  // generate a key based on the name if one is not provided
  static async generateKey(type: EventType) {
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
  }
}
