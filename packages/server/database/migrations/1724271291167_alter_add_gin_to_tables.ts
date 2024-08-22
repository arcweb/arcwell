import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['tags'], 'user_tags_gin', 'gin')
    })

    this.schema.alterTable('people', (table) => {
      table.index(['tags'], 'people_tags_gin', 'gin')
    })

    this.schema.alterTable('person_types', (table) => {
      table.index(['tags'], 'person_types_tags_gin', 'gin')
    })

    this.schema.alterTable('resources', (table) => {
      table.index(['tags'], 'resources_tags_gin', 'gin')
    })

    this.schema.alterTable('resource_types', (table) => {
      table.index(['tags'], 'resource_types_tags_gin', 'gin')
    })

    this.schema.alterTable('events', (table) => {
      table.index(['tags'], 'events_tags_gin', 'gin')
    })

    this.schema.alterTable('event_types', (table) => {
      table.index(['tags'], 'event_types_tags_gin', 'gin')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropIndex('user_tags_gin')
      table.dropColumn('tags')
    })

    this.schema.alterTable('people', (table) => {
      table.dropIndex('people_tags_gin')
    })

    this.schema.alterTable('person_types', (table) => {
      table.dropIndex('person_types_tags_gin')
    })

    this.schema.alterTable('resources', (table) => {
      table.dropIndex('resources_tags_gin')
    })

    this.schema.alterTable('resource_types', (table) => {
      table.dropIndex('resource_types_tags_gin')
    })

    this.schema.alterTable('events', (table) => {
      table.dropIndex('events_tags_gin')
    })

    this.schema.alterTable('event_types', (table) => {
      table.dropIndex('event_types_tags_gin')
    })
  }
}
