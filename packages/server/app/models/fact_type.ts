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
import DimensionType from '#models/dimension_type'
import { generateTypeKey } from '#helpers/generate_type_key'

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

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => DimensionType, {
    pivotTimestamps: true,
    pivotColumns: ['is_required'],
  })
  declare dimensionTypes: ManyToMany<typeof DimensionType>

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
  // generate a key based on the name if one is not provided
  static async generateKey(type: FactType) {
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
  }
}
