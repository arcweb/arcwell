import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'people'

  async up() {
    this.schema.createTable('person_types', (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('key').unique().notNullable()
      table.string('name').notNullable()
      table.jsonb('info').nullable()
      table.jsonb('tags').defaultTo('[]').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('family_name').notNullable()
      table.string('given_name').notNullable()

      table.uuid('type_id').notNullable()
      table.foreign('type_id').references('person_types.id')

      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['family_name', 'given_name'], 'full_name_index')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })

    this.schema.alterTable('users', (table) => {
      table.uuid('person_id').notNullable()

      table.foreign('person_id').references('people.id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.schema.dropTable('person_types')

    this.schema.alterTable('users', (table) => {
      table.dropForeign('person_id')
      table.dropColumn('person_id')
    })
  }
}
