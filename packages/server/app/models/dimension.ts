import { column } from '@adonisjs/lucid/orm'

export default class Dimension {
  @column()
  declare key: string

  @column()
  declare value: string

  @column()
  declare factId: string
}
