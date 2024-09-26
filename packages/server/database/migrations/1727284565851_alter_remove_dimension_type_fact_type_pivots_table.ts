import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.dropTable('dimension_type_fact_type')
    this.schema.alterTable('fact_types', (table) => {
      table.jsonb('dimension_types').defaultTo('[]').notNullable()
      table.dropColumn('dimensions')
    })
  }

  async down() {
    this.schema.alterTable('fact_types', (table) => {
      table.dropColumn('dimension_types')
      table.jsonb('dimensions').defaultTo('{}').notNullable()
    })
    this.schema.createTable('dimension_type_fact_type', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('dimension_type_id').notNullable()
      table.uuid('fact_type_id').notNullable()
      table.boolean('is_required').notNullable().defaultTo(false)
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Constraints
      table.foreign('dimension_type_id').references('dimension_types.id').onDelete('CASCADE')
      table.foreign('fact_type_id').references('fact_types.id').onDelete('CASCADE')
      table.unique(['dimension_type_id', 'fact_type_id'])

      // Indices
      table.index(['dimension_type_id', 'fact_type_id'], 'idx_dimension_type_fact_type')
    })
  }
}
