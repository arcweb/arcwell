import { DateTime } from 'luxon'
import { afterDelete, beforeSave, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'
import Tag from '#models/tag'
import { generateTypeKey } from '#helpers/generate_type_key'
import AwBaseModel from '#models/aw_base_model'
import DimensionSchema from '#models/dimension_schema'

export default class EventType extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare dimensionSchemas: DimensionSchema[]

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
  static async generateKeyAndJson(type: EventType) {
    // generate a key based on the name if one is not provided
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (type.dimensionSchemas && typeof type.dimensionSchemas !== 'string') {
      // @ts-ignore - ignoring because dimensionSchemas has to be stringify-ed to get around knex & postgresql jsonb issue
      type.dimensionSchemas = JSON.stringify(type.dimensionSchemas)
    }
  }
}
