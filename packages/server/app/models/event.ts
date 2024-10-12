import { DateTime } from 'luxon'
import {
  afterDelete,
  beforeSave,
  belongsTo,
  column,
  hasMany,
  manyToMany,
} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import EventType from '#models/event_type'
import Fact from '#models/fact'
import Tag from '#models/tag'
import Person from '#models/person'
import Resource from '#models/resource'
import AwBaseModel from '#models/aw_base_model'
import Dimension from '#models/dimension'

export default class Event extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare dimensions: Dimension[]

  @column()
  declare typeKey: string

  @belongsTo(() => EventType, { foreignKey: 'typeKey', localKey: 'key' })
  declare eventType: BelongsTo<typeof EventType>

  @column.dateTime()
  declare startedAt: DateTime

  @column.dateTime()
  declare endedAt: DateTime

  @column()
  declare personId: string

  @column()
  declare resourceId: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Person)
  declare person: BelongsTo<typeof Person>

  @belongsTo(() => Resource)
  declare resource: BelongsTo<typeof Resource>

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

  @beforeSave()
  static async generateJson(event: Event) {
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (event.dimensions && typeof event.dimensions !== 'string') {
      // @ts-ignore - ignoring because dimensions have to be stringify-ed to get around knex & postgresql jsonb issue
      event.dimensions = JSON.stringify(event.dimensions)
    }
  }
}
