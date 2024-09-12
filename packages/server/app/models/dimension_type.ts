import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import FactType from '#models/fact_type'

export default class DimensionType extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare dataType: string

  @column()
  declare dataUnit: string

  @manyToMany(() => FactType, {
    pivotTimestamps: true,
    pivotRelatedForeignKey: 'tag_id',
  })
  declare factTypes: ManyToMany<typeof FactType>
}
