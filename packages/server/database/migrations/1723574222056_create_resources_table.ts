import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'resources'

  async up() {
    this.schema.createTable('resource_types', (table) => {
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
      table.jsonb('meta').nullable()

      table.uuid('resource_type_id').notNullable()
      table.foreign('resource_type_id').references('resource_types.id')

      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['name'], 'name_index')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable('resource_types')
  }
}
