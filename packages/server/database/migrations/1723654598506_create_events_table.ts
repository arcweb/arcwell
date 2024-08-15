import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable('event_types', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('key').unique().notNullable()
      table.string('name').notNullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()
      table.string('source').notNullable()
      table.jsonb('meta').nullable()

      table.uuid('event_type_id').notNullable()
      table.foreign('event_type_id').references('event_types.id')

      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['name'], 'event_name_index')

      table.timestamp('occurred_at')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable('event_types')
  }
}
