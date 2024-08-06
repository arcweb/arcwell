import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import PersonType from '#models/person_type'

export default class Person extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare familyName: string

  @column()
  declare givenName: string

  @column()
  declare tags: string[]

  @hasOne(() => PersonType)
  declare type: HasOne<typeof PersonType>

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
