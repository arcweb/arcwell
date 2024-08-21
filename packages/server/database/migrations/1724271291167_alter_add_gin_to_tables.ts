import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.jsonb('tags').defaultTo('[]').notNullable()
      table.index(['tags'], 'tags_gin', 'gin')
    })
  }

  async down() {
    this.schema.alterTable('users', (table) => {
      table.dropIndex('tags_gin')
      table.dropColumn('tags')
    })
  }
}
