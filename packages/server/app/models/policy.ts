import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Role from '#models/role'

export default class Policy extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare capabilities: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Role, {
    pivotTable: 'policy_role',
    // pivotColumns: ['can_have_other_columns'],
    pivotTimestamps: true,
    // localKey: 'id', // TODO: Likely don't need this or anything below because current fields follow convention
    // relatedKey: 'id',
    // pivotForeignKey: 'role_id',
    // pivotRelatedForeignKey: 'policy_id'
  })
  declare roles: ManyToMany<typeof Role>
}
