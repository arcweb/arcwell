import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Person from '#models/person'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Cohort extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare rules: Object | null

  @column()
  declare tags: string[]

  @manyToMany(() => Person, {
    pivotTimestamps: true,
    pivotTable: 'cohort_person',
  })
  declare people: ManyToMany<typeof Person>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
