import { BaseModel, beforeSave, column } from '@adonisjs/lucid/orm'

import { generateTypeKey } from '#helpers/generate_type_key'
import { DateTime } from 'luxon'

export default class DimensionSchemaModel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare dataType: string

  @column()
  declare dataUnit: string | null

  @column()
  declare isRequired: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeSave()
  // generate a key based on the name if one is not provided
  static async generateKey(type: DimensionSchemaModel) {
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
  }
}
