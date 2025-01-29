import { afterDelete, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import AwBaseModel from './aw_base_model'
import { DateTime } from 'luxon'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Tag from './tag'
import FileType from './file_type'

export default class File extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ meta: { type: 'string' } })
  declare typeKey: string

  @belongsTo(() => FileType, { foreignKey: 'typeKey', localKey: 'key' })
  declare factType: BelongsTo<typeof FileType>

  @column()
  declare name: string

  @column()
  declare extension: string

  @column()
  declare url: string

  @column()
  declare size: string

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
  static async detachTags(file: File) {
    await file.related('tags').detach()
  }
}
