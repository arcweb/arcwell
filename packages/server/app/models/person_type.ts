import { DateTime } from 'luxon'
import { afterDelete, beforeSave, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Tag from '#models/tag'
import { generateTypeKey } from '#helpers/generate_type_key'
import AwBaseModel from '#models/aw_base_model'

export default class PersonType extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @hasMany(() => Person, { foreignKey: 'typeKey', localKey: 'key' })
  declare people: HasMany<typeof Person>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Tag, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'object_id',
    pivotRelatedForeignKey: 'tag_id',
  })
  declare tags: ManyToMany<typeof Tag>

  @afterDelete()
  static async detachTags(personType: PersonType) {
    await personType.related('tags').detach()
  }

  @beforeSave()
  // generate a key based on the name if one is not provided
  static async generateKey(type: PersonType) {
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
  }
}
