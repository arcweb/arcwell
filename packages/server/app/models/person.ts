import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import PersonType from '#models/person_type'
import Fact from '#models/fact'

export default class Person extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare familyName: string

  @column()
  declare givenName: string

  @column()
  declare personTypeId: string

  @column()
  declare tags: string[]

  @belongsTo(() => PersonType)
  declare personType: BelongsTo<typeof PersonType>

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasMany(() => Fact)
  declare facts: HasMany<typeof Fact>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
