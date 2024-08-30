import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cohorts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('name').notNullable()

      table.string('description').nullable()
      table.jsonb('rules').nullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable('cohort_person', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.uuid('person_id').notNullable()
      table.uuid('cohort_id').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.foreign('person_id').references('people.id')
      table.foreign('cohort_id').references('cohorts.id')
    })
  }

  async down() {
    this.schema.dropTable('cohort_person')
    this.schema.dropTable(this.tableName)
  }
}
