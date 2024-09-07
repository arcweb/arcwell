import { DateTime } from 'luxon'
import { afterDelete, BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Person from '#models/person'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Tag from '#models/tag'

export default class Cohort extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare rules: Object | null

  @manyToMany(() => Person, {
    pivotTimestamps: true,
    pivotTable: 'cohort_person',
  })
  declare people: ManyToMany<typeof Person>

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
  static async detachTags(cohort: Cohort) {
    await cohort.related('tags').detach()
  }
}
