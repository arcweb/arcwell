import { afterDelete, column, manyToMany } from '@adonisjs/lucid/orm'
import AwBaseModel from './aw_base_model'
import { DateTime } from 'luxon'
import { ManyToMany } from '@adonisjs/lucid/types/relations'
import Cohort from './cohort'
import Tag from './tag'

export default class File extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare extension: string

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
