import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.dropTable('dimensions')
    this.schema.alterTable('facts', (table) => {
      table.jsonb('dimensions').defaultTo('[]').notNullable()
      table.dropColumn('info')
      table.index(['dimensions'], 'facts_dimensions_gin', 'gin')
    })
    this.schema.alterTable('fact_types', (table) => {
      table.index(['dimension_types'], 'fact_types_dimensions_types_gin', 'gin')
    })
  }

  async down() {
    this.schema.alterTable('fact_types', (table) => {
      table.dropIndex(['fact_types'], 'fact_types_dimensions_types_gin')
    })
    this.schema.alterTable('facts', (table) => {
      table.dropIndex(['dimensions'], 'facts_dimensions_gin')
      table.dropColumn('dimensions')
      table.jsonb('info').defaultTo('[]').notNullable()
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
  }
}
