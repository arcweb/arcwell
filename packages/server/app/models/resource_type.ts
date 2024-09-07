import { DateTime } from 'luxon'
import { afterDelete, BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Resource from '#models/resource'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Tag from '#models/tag'

export default class ResourceType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @hasMany(() => Resource, { foreignKey: 'typeKey', localKey: 'key' })
  declare resources: HasMany<typeof Resource>

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
  static async detachTags(resourceType: ResourceType) {
    await resourceType.related('tags').detach()
  }
}
