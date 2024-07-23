import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Policy from '#models/policy'

export default class Role extends BaseModel {
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
    // pivotColumns: ['can_have_other_columns'],
    pivotTimestamps: true,
    // localKey: 'id', // TODO: Likely don't need this or anything below because current fields follow convention
    // relatedKey: 'id',
    // pivotForeignKey: 'policy_id',
    // pivotRelatedForeignKey: 'role_id'
  })
  declare policies: ManyToMany<typeof Policy>
}
