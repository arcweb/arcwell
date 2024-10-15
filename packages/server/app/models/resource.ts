import { DateTime } from 'luxon'
import {
  afterDelete,
  beforeSave,
  belongsTo,
  column,
  hasMany,
  manyToMany,
  scope,
} from '@adonisjs/lucid/orm'
import ResourceType from '#models/resource_type'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Fact from '#models/fact'
import Tag from '#models/tag'
import Event from '#models/event'
import AwBaseModel from '#models/aw_base_model'
import Dimension from '#models/dimension'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Resource extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare dimensions: Dimension[]

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

  @beforeSave()
  static async generateJson(resource: Resource) {
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (resource.dimensions && typeof resource.dimensions !== 'string') {
      // @ts-ignore - ignoring because dimensions have to be stringify-ed to get around knex & postgresql jsonb issue
      resource.dimensions = JSON.stringify(resource.dimensions)
    }
  }

  static fullResource = scope((query: ModelQueryBuilderContract<typeof Resource>) => {
    query.preload('tags')
    query.preload('resourceType', resourceTypeQuery => {
      resourceTypeQuery.preload('tags')
    })
  })
}
