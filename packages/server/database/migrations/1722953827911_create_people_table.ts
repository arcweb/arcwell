import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'people'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('family_name').notNullable()
      table.string('given_name').notNullable()
      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['family_name', 'given_name'], 'full_name_index')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.alterTable('users', (table) => {
      table.uuid('person_id').notNullable()

      table.foreign('person_id').references('people.id')
    })

    this.schema.createTable('people_types', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('key').unique()
      table.string('name')
      table.jsonb('info')
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
