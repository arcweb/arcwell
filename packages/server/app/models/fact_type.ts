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
import Fact from '#models/fact'
import Tag from '#models/tag'
import { generateTypeKey } from '#helpers/generate_type_key'
import { DimensionTypeModel } from '@arcweb/arcwell-admin/src/app/shared/models/dimension-type.model'

export default class FactType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => Fact, { foreignKey: 'typeKey', localKey: 'key' })
  declare facts: HasMany<typeof Fact>

  @column()
  declare dimensionTypes: DimensionTypeModel[]

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
  static async detachTags(factType: FactType) {
    await factType.related('tags').detach()
  }

  @beforeSave()
  static async generateKeyAndJson(type: FactType) {
    // generate a key based on the name if one is not provided
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (type.dimensionTypes) {
      // @ts-ignore - ignoring because dimensionTypes has to be stringify-ed to get around knex & postgresql jsonb issue
      type.dimensionTypes = JSON.stringify(type.dimensionTypes)
    }
  }
}
