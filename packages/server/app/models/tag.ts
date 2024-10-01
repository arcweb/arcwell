import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Resource from './resource'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pathname: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @manyToMany(() => Person, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
    // pivotColumns: ['object_type'],
  })
  declare people: ManyToMany<typeof Person>
}
