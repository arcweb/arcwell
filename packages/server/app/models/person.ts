import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import PersonType from '#models/person_type'
import Fact from '#models/fact'
import Cohort from '#models/cohort'
import Tag from '#models/tag'

export default class Person extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare familyName: string

  @column()
  declare givenName: string

  @column()
  declare typeKey: string

  // @column()
  // declare tags: string[]

  @belongsTo(() => PersonType, { foreignKey: 'typeKey', localKey: 'key' })
  declare personType: BelongsTo<typeof PersonType>

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasMany(() => Fact)
  declare facts: HasMany<typeof Fact>

  @manyToMany(() => Cohort, {
    pivotTimestamps: true,
    pivotTable: 'cohort_person',
  })
  declare cohorts: ManyToMany<typeof Cohort>

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
    // pivotColumns: ['object_type'],
  })
  declare tags: ManyToMany<typeof Tag>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
