import { BaseModel, beforeSave, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

import FactType from '#models/fact_type'
import { generateTypeKey } from '#helpers/generate_type_key'

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

  @beforeSave()
  // generate a key based on the name if one is not provided
  static async generateKey(type: DimensionType) {
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
  }
}
