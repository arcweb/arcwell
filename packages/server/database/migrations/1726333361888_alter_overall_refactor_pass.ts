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
  }
}
