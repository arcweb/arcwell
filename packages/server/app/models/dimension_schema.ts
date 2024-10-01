import { column } from '@adonisjs/lucid/orm'

export default class DimensionSchema {
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
}
