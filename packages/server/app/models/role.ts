import { DateTime } from 'luxon'
import { column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Policy from '#models/policy'
import AwBaseModel from '#models/aw_base_model'

export default class Role extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => User)
  declare users: HasMany<typeof User>

  @manyToMany(() => Policy, {
    pivotTable: 'policy_role',
    pivotTimestamps: true,
  })
  declare policies: ManyToMany<typeof Policy>
}
