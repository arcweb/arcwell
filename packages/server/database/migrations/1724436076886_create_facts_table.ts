import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'facts'

  async up() {
    this.schema.createTable('fact_types', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.string('key').unique().notNullable()
      table.string('name').notNullable()
      table.jsonb('dimensions').defaultTo('{}').notNullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.index(['tags'], 'fact_types_tags_gin', 'gin')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.string('type_key').notNullable()
      table.uuid('person_id')
      table.uuid('resource_id')
      table.uuid('event_id')

      table.foreign('type_key').references('fact_types.key')
      table.foreign('person_id').references('people.id')
      table.foreign('resource_id').references('resources.id')
      table.foreign('event_id').references('events.id')

      table.timestamp('created_at')
      table.timestamp('updated_at')
      table.timestamp('observed_at').notNullable()

      table.jsonb('dimensions').defaultTo('{}').notNullable()
      table.jsonb('meta').defaultTo('{}').notNullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.index(['tags'], 'fact_tags_gin', 'gin')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable('fact_types')
  }
}
