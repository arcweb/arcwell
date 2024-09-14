import { DateTime } from 'luxon'
import { afterDelete, BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import ResourceType from '#models/resource_type'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Fact from '#models/fact'
import Tag from '#models/tag'
import Event from '#models/event'

export default class Resource extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare info: Object | null

  @column()
  declare typeKey: string

  @belongsTo(() => ResourceType, { foreignKey: 'typeKey', localKey: 'key' })
  declare resourceType: BelongsTo<typeof ResourceType>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

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
  static async detachTags(resource: Resource) {
    await resource.related('tags').detach()
  }
}
