import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('events', (table) => {
      table.dropForeign('event_type_id')
      table.dropColumn('event_type_id')

      table.string('type_key').notNullable()
      table.foreign('type_key').references('event_types.key')
    })

    this.schema.alterTable('people', (table) => {
      table.dropForeign('person_type_id')
      table.dropColumn('person_type_id')

      table.string('type_key').notNullable()
      table.foreign('type_key').references('person_types.key')
    })

    this.schema.alterTable('resources', (table) => {
      table.dropForeign('resource_type_id')
      table.dropColumn('resource_type_id')

      table.string('type_key').notNullable()
      table.foreign('type_key').references('resource_types.key')
    })
  }

  async down() {
    this.schema.alterTable('events', (table) => {
      table.dropForeign('type_key')
      table.dropColumn('type_key')

      table.uuid('event_type_id')
      table.foreign('event_type_id').references('event_types.id')
    })

    this.schema.alterTable('people', (table) => {
      table.dropForeign('type_key')
      table.dropColumn('type_key')

      table.uuid('person_type_id')
      table.foreign('person_type_id').references('person_types.id')
    })

    this.schema.alterTable('resources', (table) => {
      table.dropForeign('type_key')
      table.dropColumn('type_key')

      table.uuid('resource_type_id')
      table.foreign('resource_type_id').references('resource_types.id')
    })
  }
}
