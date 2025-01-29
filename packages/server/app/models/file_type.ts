import { generateTypeKey } from '#helpers/generate_type_key'
import { column, hasMany, manyToMany, afterDelete, beforeSave } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AwBaseModel from './aw_base_model'
import DimensionSchema from './dimension_schema'
import File from './file'
import Tag from './tag'

export default class FileType extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column({ meta: { type: 'string' } })
  declare name: string

  @column({ meta: { type: 'string' } })
  declare description: string

  @hasMany(() => File, { foreignKey: 'typeKey', localKey: 'key' })
  declare files: HasMany<typeof File>

  @column()
  declare dimensionSchemas: DimensionSchema[]

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
  static async detachTags(fileType: FileType) {
    await fileType.related('tags').detach()
  }

  @beforeSave()
  static async generateKeyAndJson(type: FileType) {
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
