import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('cohorts', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('events', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('event_types', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('facts', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('fact_types', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('person_types', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('resources', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('resource_types', (table) => {
      table.dropColumn('tags')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('tags')
    })
  }

  async down() {
    this.schema.alterTable('cohorts', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('events', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('event_types', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('facts', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('fact_types', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('person_types', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('resources', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('resource_types', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('users', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
    })
  }
}
