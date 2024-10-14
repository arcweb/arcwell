import { DateTime } from 'luxon'
import {
  afterDelete,
  beforeSave,
  belongsTo,
  column,
  hasMany,
  hasOne,
  manyToMany,
} from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany, HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import PersonType from '#models/person_type'
import Fact from '#models/fact'
import Cohort from '#models/cohort'
import Tag from '#models/tag'
import Event from '#models/event'
import AwBaseModel from '#models/aw_base_model'
import Dimension from '#models/dimension'

export default class Person extends AwBaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare familyName: string

  @column()
  declare givenName: string

  @column()
  declare typeKey: string

  @column()
  declare dimensions: Dimension[]

  @belongsTo(() => PersonType, { foreignKey: 'typeKey', localKey: 'key' })
  declare personType: BelongsTo<typeof PersonType>

  @hasOne(() => User)
  declare user: HasOne<typeof User>

  @hasMany(() => Fact)
  declare facts: HasMany<typeof Fact>

  @hasMany(() => Event)
  declare events: HasMany<typeof Event>

  @manyToMany(() => Cohort, {
    pivotTimestamps: true,
    pivotTable: 'cohort_person',
  })
  declare cohorts: ManyToMany<typeof Cohort>

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
  static async detachTags(person: Person) {
    await person.related('tags').detach()
  }

  serializeExtras() {
    return {
      cohortsCount: Number.parseInt(this.$extras.cohorts_count),
    }
  }

  @beforeSave()
  static async generateJson(person: Person) {
    // stringify jsonb column to circumvent issue with knex and postgresql
    if (person.dimensions && typeof person.dimensions !== 'string') {
      // @ts-ignore - ignoring because dimensions have to be stringify-ed to get around knex & postgresql jsonb issue
      person.dimensions = JSON.stringify(person.dimensions)
    }
  }
}
