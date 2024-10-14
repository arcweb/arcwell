import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('events', (table) => {
      table.jsonb('dimensions').defaultTo('[]').notNullable()
      table.dropColumn('info')
      table.index(['dimensions'], 'events_dimensions_gin', 'gin')
    })

    this.schema.alterTable('event_types', (table) => {
      table.jsonb('dimension_schemas').defaultTo('[]').notNullable()
      table.index(['dimension_schemas'], 'event_types_dimensions_gin', 'gin')
    })

    this.schema.alterTable('people', (table) => {
      table.jsonb('dimensions').defaultTo('[]').notNullable()
      table.dropColumn('info')
      table.index(['dimensions'], 'people_dimensions_gin', 'gin')
    })

    this.schema.alterTable('person_types', (table) => {
      table.jsonb('dimension_schemas').defaultTo('[]').notNullable()
      table.index(['dimension_schemas'], 'person_types_dimensions_gin', 'gin')
    })

    this.schema.alterTable('resources', (table) => {
      table.jsonb('dimensions').defaultTo('[]').notNullable()
      table.dropColumn('info')
      table.index(['dimensions'], 'resources_dimensions_gin', 'gin')
    })

    this.schema.alterTable('resource_types', (table) => {
      table.jsonb('dimension_schemas').defaultTo('[]').notNullable()
      table.index(['dimension_schemas'], 'resource_types_dimensions_gin', 'gin')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('info')
    })

    this.schema.alterTable('cohorts', (table) => {
      table.dropColumn('rules')
    })

    ///rules: vine.object({}).allowUnknownProperties().optional(),
  }

  async down() {
    this.schema.alterTable('events', (table) => {
      table.dropIndex(['dimensions'], 'events_dimensions_gin')
      table.dropColumn('dimensions')
      table.jsonb('info').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('event_types', (table) => {
      table.dropIndex(['dimension_schemas'], 'event_types_dimensions_gin')
      table.dropColumn('dimension_schemas')
    })

    this.schema.alterTable('people', (table) => {
      table.dropIndex(['dimensions'], 'people_dimensions_gin')
      table.dropColumn('dimensions')
      table.jsonb('info').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('person_types', (table) => {
      table.dropIndex(['dimension_schemas'], 'person_types_dimensions_gin')
      table.dropColumn('dimension_schemas')
    })

    this.schema.alterTable('resources', (table) => {
      table.dropIndex(['dimensions'], 'resources_dimensions_gin')
      table.dropColumn('dimensions')
      table.jsonb('info').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('resource_types', (table) => {
      table.dropIndex(['dimension_schemas'], 'resource_types_dimensions_gin')
      table.dropColumn('dimension_schemas')
    })

    this.schema.alterTable('users', (table) => {
      table.jsonb('info').defaultTo('[]').notNullable()
    })

    this.schema.alterTable('cohorts', (table) => {
      table.jsonb('rules').defaultTo('{}').notNullable()
    })
  }
}
