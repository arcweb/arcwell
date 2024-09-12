import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('facts', (table) => {
      table.dropColumn('dimensions')
    })

    this.schema.alterTable('fact_types', (table) => {
      table.string('description').nullable()
    })

    this.schema.createTable('dimensions', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('fact_id').notNullable()
      table.string('key').notNullable()
      table.string('value').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.foreign('fact_id').references('facts.id').onDelete('CASCADE')
    })

    this.schema.createTable('dimension_types', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.string('key').unique().notNullable()
      table.string('name').notNullable()
      table.string('data_type').notNullable()
      table.string('data_unit').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
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

  async down() {
    this.schema.dropTable('dimension_type_fact_type')

    this.schema.dropTable('dimension_types')

    this.schema.alterTable('facts', (table) => {
      table.jsonb('dimensions').defaultTo('{}').notNullable()
    })

    this.schema.alterTable('fact_types', (table) => {
      table.dropColumn('description')
    })

    this.schema.dropTable('dimensions')
  }
}
