import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'
import Person from '#models/person'
import Resource from '#models/resource'
import Fact from '#models/fact'
import User from '#models/user'

export default class Tag extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pathname: string

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare updatedAt: DateTime

  @manyToMany(() => Event, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
  })
  declare events: ManyToMany<typeof Event>

  @manyToMany(() => Fact, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
  })
  declare facts: ManyToMany<typeof Fact>

  @manyToMany(() => Person, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
    // pivotColumns: ['object_type'],
  })
  declare people: ManyToMany<typeof Person>

  @manyToMany(() => Resource, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
  })
  declare resources: ManyToMany<typeof Resource>

  @manyToMany(() => User, {
    pivotTimestamps: true,
    pivotTable: 'tag_object',
    pivotForeignKey: 'tag_id',
    pivotRelatedForeignKey: 'object_id',
  })
  declare users: ManyToMany<typeof User>

  serializeExtras() {
    return {
      eventsCount: Number.parseInt(this.$extras.events_count),
      factsCount: Number.parseInt(this.$extras.facts_count),
      peopleCount: Number.parseInt(this.$extras.people_count),
      resourcesCount: Number.parseInt(this.$extras.resources_count),
      usersCount: Number.parseInt(this.$extras.users_count),
    }
  }
}
