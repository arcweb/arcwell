import { DateTime } from 'luxon'
import { afterDelete, beforeSave, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Person from '#models/person'
import Tag from '#models/tag'
import { generateTypeKey } from '#helpers/generate_type_key'
import AwBaseModel from '#models/aw_base_model'
import DimensionSchema from '#models/dimension_schema'

export default class PersonType extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare key: string

  @column()
  declare name: string

  @column()
  declare description: string

  @column()
  declare dimensionSchemas: DimensionSchema[]

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
  static async generateKeyAndJson(type: PersonType) {
    // generate a key based on the name if one is not provided
    if (!type.key) {
      type.key = generateTypeKey(type.name)
    }
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (type.dimensionSchemas && typeof type.dimensionSchemas !== 'string') {
      // @ts-ignore - ignoring because dimensionSchemas has to be stringify-ed to get around knex & postgresql jsonb issue
      type.dimensionSchemas = JSON.stringify(type.dimensionSchemas)
    }
  }
}
