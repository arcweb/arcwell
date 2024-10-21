import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('person_types', (table) => {
      table.dropColumn('info')
    })
    this.schema.alterTable('events', (table) => {
      table.dropColumn('meta')
      table.jsonb('info').defaultTo('{}').notNullable()
    })
    this.schema.alterTable('people', (table) => {
      table.jsonb('info').defaultTo('{}').notNullable()
    })
    this.schema.alterTable('resources', (table) => {
      table.dropColumn('meta')
      table.jsonb('info').defaultTo('{}').notNullable()
    })
    this.schema.alterTable('facts', (table) => {
      table.dropColumn('meta')
      table.jsonb('info').defaultTo('{}').notNullable()
    })
    this.schema.alterTable('users', (table) => {
      table.jsonb('info').defaultTo('{}').notNullable()
      table.dropColumn('full_name')
    })

    this.schema.alterTable('person_types', (table) => {
      table.string('description').nullable()
    })
    this.schema.alterTable('resource_types', (table) => {
      table.string('description').nullable()
    })
    this.schema.alterTable('event_types', (table) => {
      table.string('description').nullable()
    })

    this.schema.alterTable('events', (table) => {
      table.timestamp('started_at').defaultTo(this.raw('now()'))
      table.timestamp('ended_at').nullable()
      table.dropColumn('occurred_at')
      table.dropColumn('source')
      table.dropColumn('name')
      table.uuid('person_id').nullable()
      table.uuid('resource_id').nullable()
      table.foreign('person_id').references('people.id')
      table.foreign('resource_id').references('resources.id')
    })
  }

  async down() {
    this.schema.alterTable('person_types', (table) => {
      table.jsonb('info').nullable()
    })
    this.schema.alterTable('events', (table) => {
      table.renameColumn('info', 'meta')
    })
    this.schema.alterTable('people', (table) => {
      table.dropColumn('info')
    })
    this.schema.alterTable('resources', (table) => {
      table.renameColumn('info', 'meta')
    })
    this.schema.alterTable('facts', (table) => {
      table.renameColumn('info', 'meta')
    })
    this.schema.alterTable('users', (table) => {
      table.dropColumn('info')
      table.string('full_name').nullable()
    })

    this.schema.alterTable('person_types', (table) => {
      table.dropColumn('description')
    })
    this.schema.alterTable('resource_types', (table) => {
      table.dropColumn('description')
    })
    this.schema.alterTable('event_types', (table) => {
      table.dropColumn('description')
    })
    this.schema.alterTable('events', (table) => {
      table.dropColumn('started_at')
      table.dropColumn('ended_at')
      table.timestamp('occurred_at')
      table.string('name').notNullable().defaultTo('migration_placeholder')
      table.string('source').notNullable().defaultTo('migration_placeholder')
      table.dropForeign('person_id')
      table.dropColumn('person_id')
      table.dropForeign('resource_id')
      table.dropColumn('resource_id')
    })
  }
}
